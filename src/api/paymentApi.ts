// src/api/paymentApi.ts
import api from './index';

export const paymentApi = {
  /**
   * Get payment status for an order
   * @param orderId - The order ID
   */
  getPaymentStatus: async (orderId: number): Promise<any> => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },

  /**
   * Generate a new payment for an existing order
   * @param orderId - The order ID
   */
  generatePayment: async (orderId: number): Promise<any> => {
    const response = await api.post(`/payments/generate/${orderId}`);
    return response.data;
  },

  /**
   * Cancel payment for an order
   * @param orderId - The order ID
   */
  cancelPayment: async (orderId: number): Promise<any> => {
    const response = await api.post(`/payments/cancel/${orderId}`);
    return response.data;
  }
};