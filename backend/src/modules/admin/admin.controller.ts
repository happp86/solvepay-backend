import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  UnauthorizedException,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Simple inline guard for admin JWT
function verifyAdminToken(authorization: string, jwtService: JwtService, configService: ConfigService) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedException('No admin token provided');
  }
  const token = authorization.replace('Bearer ', '');
  try {
    const payload = jwtService.verify(token, {
      secret: configService.get<string>('ADMIN_JWT_SECRET', 'solvepay_admin_super_secret_2026'),
    });
    if (payload.role !== 'admin') throw new Error('Not admin');
    return payload;
  } catch {
    throw new UnauthorizedException('Invalid or expired admin token');
  }
}

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Admin Login ───────────────────────────────────────────────────────────
  @Post('login')
  async login(@Body() body: { password: string }) {
    return this.adminService.login(body.password);
  }

  // ─── Dashboard Stats ────────────────────────────────────────────────────────
  @Get('dashboard')
  async getDashboard(@Headers('authorization') auth: string) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.getDashboardStats();
  }

  // ─── Get All Users ──────────────────────────────────────────────────────────
  @Get('users')
  async getAllUsers(
    @Headers('authorization') auth: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.getAllUsers(Number(page), Number(limit), search);
  }

  // ─── Search User by App ID ──────────────────────────────────────────────────
  @Get('users/appid/:appId')
  async getUserByAppId(
    @Headers('authorization') auth: string,
    @Param('appId') appId: string,
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.getUserByAppId(appId);
  }

  // ─── Get User by ID ─────────────────────────────────────────────────────────
  @Get('users/:id')
  async getUserById(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.getUserById(id);
  }

  // ─── Adjust Wallet Balance ───────────────────────────────────────────────────
  @Put('users/:id/wallet')
  async adjustWallet(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { amount: number; reason: string },
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.adjustWalletBalance(id, body.amount, body.reason);
  }

  // ─── Delete User Permanently ────────────────────────────────────────────────
  @Put('users/:id/delete')
  async deleteUser(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.deleteUserPermanently(id);
  }

  // ─── All Orders ──────────────────────────────────────────────────────────────
  @Get('orders')
  async getAllOrders(
    @Headers('authorization') auth: string,
    @Query('page') page: string = '1',
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.getAllOrders(Number(page));
  }

  // ─── Update Order Status ────────────────────────────────────────────────────
  @Put('orders/:id/status')
  async updateOrderStatus(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() body: { status: 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS' },
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.updateOrderStatus(id, body.status);
  }

  // ─── All Transactions ────────────────────────────────────────────────────────
  @Get('transactions')
  async getAllTransactions(
    @Headers('authorization') auth: string,
    @Query('page') page: string = '1',
  ) {
    verifyAdminToken(auth, this.jwtService, this.configService);
    return this.adminService.getAllTransactions(Number(page));
  }
}
