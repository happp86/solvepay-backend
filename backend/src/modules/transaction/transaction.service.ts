import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: true,
      },
    });
  }

  async getTransactionStats(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId, status: 'SUCCESS' },
    });

    const totalVolume = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
    const totalCommissions = transactions
      .filter((t) => t.type === 'ORDER_COMMISSION')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const completedOrdersCount = transactions.filter(
      (t) => t.type === 'ORDER_COMMISSION',
    ).length;

    return {
      totalVolume,
      totalCommissions,
      completedOrdersCount,
      totalTransactions: transactions.length,
    };
  }
}
