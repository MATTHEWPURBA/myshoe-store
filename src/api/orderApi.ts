// src/api/orderApi.ts
import api from './index';
import { Order, CartItem } from '../types';


interface ShippingInfo {
  shippingMethod: string;
  shippingFee: number;
}

export const orderApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (
    cartItems: CartItem[],
    userId: number, 
    totalAmount: number,
    shippingInfo?: ShippingInfo
  ): Promise<Order> => {
    const orderData = {
      userId: userId,
      total: totalAmount,
      items: cartItems.map(item => ({
        shoeId: item.shoe.id,
        quantity: item.quantity,
        price: item.shoe.price
      })),
      // Include shipping information if provided
      ...(shippingInfo && {
        shippingMethod: shippingInfo.shippingMethod,
        shippingFee: shippingInfo.shippingFee
      })
    };
    
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },


    // New method to delete an order
    deleteOrder: async (id: number): Promise<void> => {
      await api.delete(`/orders/${id}`);
    }


};