import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRepository } from '../user/user.repository';
import { WalletRepository } from '../wallet/wallet.repository';
import { OtpService } from '../otp/otp.service';
import { AuthRepository } from './auth.repository';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly authRepository: AuthRepository,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    return this.otpService.sendOtp(dto.phone);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    await this.otpService.verifyOtp(dto.phone, dto.code);
    return { success: true, message: 'OTP verified successfully' };
  }

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.userRepository.findByPhone(dto.phone);
    if (existingUser) {
      throw new ConflictException('Phone number is already registered.');
    }

    // 2. OTP Verification Bypassed for development/testing
    // await this.otpService.verifyOtp(dto.phone, dto.otpCode);

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 4. Generate unique Referral Code and 6-Digit App ID
    const referralCode = await this.generateUniqueReferralCode();
    const appId = await this.generateUniqueAppId();

    // 5. Check referrer if invite code provided
    let referrerId: string | null = null;
    if (dto.inviteCode) {
      const referrer = await this.userRepository.findByReferralCode(dto.inviteCode);
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // 6. Execute atomic transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await this.userRepository.createUser(
        {
          appId,
          username: dto.username,
          phone: dto.phone,
          passwordHash,
          referralCode,
        },
        tx,
      );

      let newBonus = 0;

      if (referrerId) {
        await this.userRepository.createReferralLink(referrerId, createdUser.id, tx);

        // Credit ₹50 to Referrer automatically
        const referrerWallet = await tx.wallet.findUnique({ where: { userId: referrerId } });
        if (referrerWallet) {
          await tx.wallet.update({
            where: { id: referrerWallet.id },
            data: { balance: { increment: 50 } },
          });
          await tx.transaction.create({
            data: {
              walletId: referrerWallet.id,
              userId: referrerId,
              type: 'REWARD',
              amount: 50,
              title: 'Referral Bonus',
              description: `Referral reward of ₹50 for inviting ${createdUser.username || createdUser.phone}`,
              status: 'SUCCESS',
            },
          });
        }

        // ₹75 Welcome Bonus for New User
        newBonus = 75;
      }

      const wallet = await tx.wallet.create({
        data: {
          userId: createdUser.id,
          balance: newBonus,
          currency: 'INR',
        },
      });

      if (newBonus > 0) {
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId: createdUser.id,
            type: 'REWARD',
            amount: 75,
            title: 'Welcome Referral Bonus',
            description: 'Welcome bonus of ₹75 for joining via referral code',
            status: 'SUCCESS',
          },
        });
      }

      return createdUser;
    });

    // 7. Generate JWT Tokens & save Session
    const tokens = await this.generateAndStoreTokens(user.id, user.phone, user.username);

    const userWithWallet = await this.userRepository.findById(user.id);

    return {
      success: true,
      message: 'Registration successful',
      user: this.sanitizeUser(userWithWallet),
      tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByPhone(dto.phone);
    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }

    const tokens = await this.generateAndStoreTokens(user.id, user.phone, user.username);

    return {
      success: true,
      message: 'Login successful',
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'solvepay_super_secret_refresh_key_2026_jwt',
        ),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const userId = payload.sub;
    const activeTokens = await this.authRepository.findActiveTokensByUserId(userId);

    let matchedTokenRecord: any = null;
    for (const tokenRecord of activeTokens) {
      const isMatch = await bcrypt.compare(dto.refreshToken, tokenRecord.tokenHash);
      if (isMatch) {
        matchedTokenRecord = tokenRecord;
        break;
      }
    }

    if (!matchedTokenRecord) {
      throw new UnauthorizedException('Refresh token is invalid or revoked.');
    }

    // Revoke old refresh token
    await this.authRepository.revokeToken(matchedTokenRecord.id);

    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User no longer exists.');
    }

    // Issue new pair
    const tokens = await this.generateAndStoreTokens(user.id, user.phone, user.username);

    return {
      success: true,
      tokens,
    };
  }

  async logout(userId: string) {
    await this.authRepository.revokeAllUserTokens(userId);
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateAndStoreTokens(userId: string, phone: string, username: string) {
    const payload = { sub: userId, phone, username };

    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'solvepay_super_secret_access_key_2026_jwt',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'solvepay_super_secret_refresh_key_2026_jwt',
    );

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '7d'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
    });

    // Hash refresh token before storing
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await this.authRepository.createRefreshToken(userId, refreshTokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateUniqueAppId(): Promise<string> {
    while (true) {
      // 6-digit random number between 100000 and 999999
      const appId = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await this.userRepository.findByAppId(appId);
      if (!existing) {
        return appId;
      }
    }
  }

  private async generateUniqueReferralCode(): Promise<string> {
    while (true) {
      const code = 'SP' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await this.userRepository.findByReferralCode(code);
      if (!existing) {
        return code;
      }
    }
  }

  private sanitizeUser(user: any) {
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
