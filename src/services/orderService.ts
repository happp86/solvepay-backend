import { apiClient } from './apiClient';

export interface OrderItem {
  id: string;
  orderNumber: string;
  amount: string | number;
  commissionRate: string | number;
  estimatedEarnings: string | number;
  timeRemainingSeconds: number;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  userId?: string | null;
  grabbedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export const orderService = {
  async getAvailableOrders(): Promise<OrderItem[]> {
    return apiClient.get('/orders/available');
  },

  async getUserOrders(): Promise<OrderItem[]> {
    return apiClient.get('/orders/my-orders');
  },

  async grabOrder(orderId: string): Promise<OrderItem> {
    return apiClient.post(`/orders/${orderId}/grab`);
  },

  async completeOrder(orderId: string): Promise<{
    order: OrderItem;
    wallet: any;
    creditedAmount: number;
    commissionEarned: number;
  }> {
    return apiClient.post(`/orders/${orderId}/complete`);
  },
};
