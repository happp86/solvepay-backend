import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('available')
  async getAvailableOrders() {
    return this.orderService.getAvailableOrders();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getUserOrders(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.orderService.getUserOrders(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit-utr')
  async submitUtr(
    @Req() req: any,
    @Body()
    body: {
      amount: number;
      utrNumber: string;
      voucherUrl?: string;
      payoutWallet?: string;
      payoutAccount?: string;
      payoutUpi?: string;
      orderNo?: string;
    },
  ) {
    const userId = req.user.id || req.user.sub;
    return this.orderService.submitUtrOrder(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/grab')
  async grabOrder(@Req() req: any, @Param('id') orderId: string) {
    const userId = req.user.id || req.user.sub;
    return this.orderService.grabOrder(userId, orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async completeOrder(@Req() req: any, @Param('id') orderId: string) {
    const userId = req.user.id || req.user.sub;
    return this.orderService.completeOrder(userId, orderId);
  }
}
