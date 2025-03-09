// src/api/shoeApi.ts
import api from './index';
import { Shoe, ShoeFilters, ShoeFormData } from '../types';

export const shoeApi = {
  getAllShoes: async (filters?: ShoeFilters): Promise<Shoe[]> => {
    const response = await api.get('/shoes', { params: filters });
    return response.data;
  },

  getShoeById: async (id: number): Promise<Shoe> => {
    const response = await api.get(`/shoes/${id}`);
    return response.data;
  },

  createShoe: async (shoeData: ShoeFormData): Promise<Shoe> => {
    const response = await api.post('/shoes', shoeData);
    return response.data;
  },

  updateShoe: async (id: number, shoeData: Partial<ShoeFormData>): Promise<Shoe> => {
    const response = await api.put(`/shoes/${id}`, shoeData);
    return response.data;
  },

  deleteShoe: async (id: number): Promise<void> => {
    await api.delete(`/shoes/${id}`);
  }
};
