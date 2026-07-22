import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserTransactions(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.transactionService.getUserTransactions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getTransactionStats(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.transactionService.getTransactionStats(userId);
  }
}
