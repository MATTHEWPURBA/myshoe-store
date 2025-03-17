// src/api/cartApi.ts
import api from './index';
import { CartItem } from '../types';

export const cartApi = {
  // Get user's cart from server
  getUserCart: async (): Promise<CartItem[]> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Update/save cart to server
  syncCart: async (items: CartItem[]): Promise<CartItem[]> => {
    const response = await api.post('/cart', { items });
    return response.data;
  },

  // Clear user's cart on server
  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};
