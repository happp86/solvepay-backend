import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      include: { wallet: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });
  }

  async findByReferralCode(referralCode: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { referralCode },
    });
  }

  async findByAppId(appId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { appId },
    });
  }

  async createUser(
    data: Prisma.UserCreateInput,
    prismaTx?: Prisma.TransactionClient,
  ): Promise<User> {
    const db = prismaTx || this.prisma;
    return db.user.create({
      data,
    });
  }

  async createReferralLink(
    referrerId: string,
    referredUserId: string,
    prismaTx?: Prisma.TransactionClient,
  ): Promise<void> {
    const db = prismaTx || this.prisma;
    await db.referral.create({
      data: {
        referrerId,
        referredUserId,
      },
    });
  }
}
