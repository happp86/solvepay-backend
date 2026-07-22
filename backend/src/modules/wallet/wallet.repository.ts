import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Wallet, Prisma } from '@prisma/client';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(
    userId: string,
    currency = 'INR',
    prismaTx?: Prisma.TransactionClient,
  ): Promise<Wallet> {
    const db = prismaTx || this.prisma;
    return db.wallet.create({
      data: {
        userId,
        balance: 0.0,
        currency,
      },
    });
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { userId },
    });
  }
}
