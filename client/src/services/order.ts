import { Order } from '../types/order';

import { buildApiUrl } from '../config/api';

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export const orderApi = {
  /**
   * Busca um pedido pelo Stripe Checkout Session ID
   */
  async getOrderBySessionId(sessionId: string): Promise<Order> {
    const response = await fetch(`buildApiUrl('orders/session/${sessionId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found';
      }
      throw new Error('Failed to fetch order';
    }
    
    const result: ApiResponse<Order> = await response.json();
    return result.data;
  },
};
