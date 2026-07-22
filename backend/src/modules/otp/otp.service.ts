import {
  Injectable,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  IOtpProvider,
  OTP_PROVIDER_TOKEN,
} from './interfaces/otp-provider.interface';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(OTP_PROVIDER_TOKEN) private readonly otpProvider: IOtpProvider,
  ) {}

  async sendOtp(phone: string): Promise<{ success: boolean; message: string; resendAfterSeconds: number }> {
    const resendIntervalSeconds = this.configService.get<number>('OTP_RESEND_INTERVAL_SECONDS', 30);
    const expirationMinutes = this.configService.get<number>('OTP_EXPIRATION_MINUTES', 5);

    // Rate limiting: Check if OTP was sent recently to this phone
    const recentOtp = await this.prisma.otpCode.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const secondsSinceLastOtp = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
      if (secondsSinceLastOtp < resendIntervalSeconds) {
        const remainingSeconds = Math.ceil(resendIntervalSeconds - secondsSinceLastOtp);
        throw new BadRequestException(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
        );
      }
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Save to database
    await this.prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
        isUsed: false,
      },
    });

    // Send via pluggable OTP Provider
    const message = `Your SolvePay verification code is: ${code}. Valid for ${expirationMinutes} minutes.`;
    await this.otpProvider.sendSms(phone, message);

    return {
      success: true,
      message: 'OTP sent successfully',
      resendAfterSeconds: resendIntervalSeconds,
    };
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord || otpRecord.code !== code) {
      throw new BadRequestException('Invalid or expired OTP code.');
    }

    // Mark as used
    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return true;
  }
}
