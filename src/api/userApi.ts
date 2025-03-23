// src/api/userApi.ts
import api from './index';

export const userApi = {
  // Existing methods...
  
  /**
   * Request seller status
   * @param data - Request data including reason and business info
   */
  requestSellerStatus: async (data: { reason: string; businessInfo?: string }): Promise<any> => {
    const response = await api.post('/auth/request-seller', data);
    return response.data;
  },
  
  /**
   * Check seller request status
   */
  checkSellerStatus: async (): Promise<any> => {
    const response = await api.get('/auth/seller-status');
    return response.data;
  }
};