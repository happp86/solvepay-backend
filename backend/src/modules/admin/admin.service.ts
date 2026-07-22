import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(password: string): Promise<{ token: string }> {
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD', 'SolvePay@Admin2026');
    if (password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin password');
    }
    const token = this.jwtService.sign({ role: 'admin' }, {
      secret: this.configService.get<string>('ADMIN_JWT_SECRET', 'solvepay_admin_super_secret_2026'),
      expiresIn: '7d',
    });
    return { token };
  }

  async getDashboardStats() {
    const [totalUsers, totalOrders, totalTransactions, wallets] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.transaction.count(),
      this.prisma.wallet.aggregate({ _sum: { balance: true } }),
    ]);

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { wallet: true },
    });

    return {
      totalUsers,
      totalOrders,
      totalTransactions,
      totalWalletBalance: wallets._sum.balance || 0,
      recentUsers,
    };
  }

  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as any } },
            { phone: { contains: search } },
            { appId: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: true,
          _count: { select: { orders: true, transactions: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserByAppId(appId: string) {
    const user = await this.prisma.user.findUnique({
      where: { appId },
      include: {
        wallet: true,
        orders: { orderBy: { createdAt: 'desc' }, take: 10 },
        transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        orders: { orderBy: { createdAt: 'desc' } },
        transactions: { orderBy: { createdAt: 'desc' } },
        givenReferrals: {
          include: {
            referredUser: {
              select: { id: true, username: true, phone: true, appId: true, createdAt: true },
            },
          },
        },
        receivedReferral: {
          include: {
            referrer: {
              select: { id: true, username: true, phone: true, appId: true },
            },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async adjustWalletBalance(userId: string, amount: number, reason: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const newBalance = Number(wallet.balance) + amount;
    if (newBalance < 0) throw new UnauthorizedException('Insufficient balance');

    await this.prisma.wallet.update({
      where: { userId },
      data: { balance: newBalance },
    });

    // Log transaction
    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: amount > 0 ? 'REWARD' : 'WITHDRAWAL',
        amount: Math.abs(amount),
        title: 'Admin Adjustment',
        description: reason || 'Manual balance adjustment by admin',
        status: 'SUCCESS',
      },
    });

    return { success: true, newBalance };
  }

  async deleteUserPermanently(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Delete associated data in order
    await this.prisma.transaction.deleteMany({ where: { userId } });
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.referral.deleteMany({
      where: {
        OR: [
          { referrerId: userId },
          { referredUserId: userId },
        ],
      },
    });
    await this.prisma.order.updateMany({
      where: { userId },
      data: { userId: null },
    });
    await this.prisma.wallet.deleteMany({ where: { userId } });
    await this.prisma.user.delete({ where: { id: userId } });

    return { success: true, message: `User ${user.username || user.appId} deleted permanently.` };
  }

  async getAllOrders(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, appId: true, phone: true } } },
      }),
      this.prisma.order.count(),
    ]);
    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllTransactions(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, appId: true } } },
      }),
      this.prisma.transaction.count(),
    ]);
    return { transactions, total, page, totalPages: Math.ceil(total / limit) };
  }
}
