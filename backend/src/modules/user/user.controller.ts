import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @Get('me')
  async getMe(@GetUser() user: User) {
    // Fetch fresh data from DB including wallet
    const freshUser = await this.userRepository.findById(user.id);
    if (!freshUser) {
      return { message: 'User not found' };
    }
    return {
      id: freshUser.id,
      username: freshUser.username,
      phone: freshUser.phone,
      appId: freshUser.appId,
      referralCode: freshUser.referralCode,
      createdAt: freshUser.createdAt,
      wallet: (freshUser as any).wallet
        ? {
            balance: (freshUser as any).wallet.balance?.toString() || '0',
            totalEarned: (freshUser as any).wallet.totalEarned?.toString() || '0',
          }
        : { balance: '0', totalEarned: '0' },
    };
  }
}
