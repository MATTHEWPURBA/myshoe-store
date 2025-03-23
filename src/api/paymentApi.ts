// src/api/paymentApi.ts
import api from './index';
import { Currency } from '../types';


export const paymentApi = {
  /**
   * Get the payment status for an order
   * @param orderId The ID of the order
   */
  async getPaymentStatus(orderId: number) {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data;
  },

  /**
   * Generate a payment for an order
   * @param orderId The ID of the order
   * @param currency The currency to use for the payment (optional, defaults to USD)
   */
  async generatePayment(orderId: number, currency: string = 'USD') {
    const response = await api.post('/payments/generate', { 
      orderId, 
      currency 
    });
    return response.data;
  },
  
  
  
  /**
   * Get the available currencies for payment
   */
  async getAvailableCurrencies(): Promise<Currency[]> {
    const response = await api.get('/payments/currencies');
    return response.data;
  },
  
  /**
   * Cancel a payment for an order
   * @param orderId The ID of the order
   */
  async cancelPayment(orderId: number) {
    const response = await api.post(`/payments/cancel/${orderId}`);
    return response.data;
  }
};