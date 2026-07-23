import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async seedInitialOrders() {
    const existingCount = await this.prisma.order.count();
    if (existingCount > 0) return;

    const seedData = [
      { amount: 500, timeRemainingSeconds: 300 },
      { amount: 1000, timeRemainingSeconds: 450 },
      { amount: 2000, timeRemainingSeconds: 600 },
      { amount: 3500, timeRemainingSeconds: 900 },
      { amount: 5000, timeRemainingSeconds: 1200 },
      { amount: 10000, timeRemainingSeconds: 1800 },
    ];

    for (let i = 0; i < seedData.length; i++) {
      const item = seedData[i];
      const commissionRate = 4.0;
      const estimatedEarnings = (item.amount * commissionRate) / 100;
      const orderNumber = `ORD${Date.now()}${i + 1}`;

      await this.prisma.order.create({
        data: {
          orderNumber,
          amount: item.amount,
          commissionRate,
          estimatedEarnings,
          timeRemainingSeconds: item.timeRemainingSeconds,
          status: OrderStatus.AVAILABLE,
        },
      });
    }
  }

  async getAvailableOrders() {
    await this.seedInitialOrders();
    return this.prisma.order.findMany({
      where: { status: OrderStatus.AVAILABLE },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async grabOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.AVAILABLE) {
      throw new BadRequestException('Order is no longer available');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.IN_PROGRESS,
        userId,
        grabbedAt: new Date(),
      },
    });
  }

  async completeOrder(userId: string, orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.userId !== userId) {
        throw new BadRequestException('You do not own this order');
      }

      if (order.status !== OrderStatus.IN_PROGRESS) {
        throw new BadRequestException('Order cannot be completed in current state');
      }

      // Find user wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0.0, currency: 'INR' },
        });
      }

      const commissionEarnings = Number(order.estimatedEarnings);
      const totalCredit = Number(order.amount) + commissionEarnings;

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: totalCredit,
          },
        },
      });

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Create transaction record for commission and order settlement
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          orderId: order.id,
          type: TransactionType.ORDER_COMMISSION,
          amount: totalCredit,
          title: `Order #${order.orderNumber} Completed`,
          description: `Order Amount ₹${order.amount} + 4.0% Commission (₹${commissionEarnings}) credited to wallet`,
          status: TransactionStatus.SUCCESS,
        },
      });

      return {
        order: updatedOrder,
        wallet: updatedWallet,
        creditedAmount: totalCredit,
        commissionEarned: commissionEarnings,
      };
    });
  }
}
