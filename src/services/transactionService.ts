import { apiClient } from './apiClient';

export interface TransactionItem {
  id: string;
  walletId: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'ORDER_COMMISSION' | 'REWARD' | 'REFERRAL_BONUS';
  amount: string | number;
  title: string;
  description?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  orderId?: string | null;
  createdAt: string;
}

export interface TransactionStats {
  totalVolume: number;
  totalCommissions: number;
  completedOrdersCount: number;
  totalTransactions: number;
}

export const transactionService = {
  async getUserTransactions(): Promise<TransactionItem[]> {
    return apiClient.get('/transactions');
  },

  async getTransactionStats(): Promise<TransactionStats> {
    return apiClient.get('/transactions/stats');
  },
};
