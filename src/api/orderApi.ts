// src/api/orderApi.ts
import api from './index';
import { Order, CartItem } from '../types';

export const orderApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (cartItems: CartItem[],userId: number, totalAmount: number): Promise<Order> => {
    const orderData = {
      userId: userId,
      total: totalAmount,
      items: cartItems.map(item => ({
        shoeId: item.shoe.id,
        quantity: item.quantity,
        price: item.shoe.price
      }))
    };
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};