// src/api/adminApi.ts
import api from './index';

export const adminApi = {
  /**
   * Get all users (SuperAdmin only)
   */
  getAllUsers: async (): Promise<any> => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  /**
   * Get pending seller requests (SuperAdmin only)
   */
  getPendingSellerRequests: async (): Promise<any> => {
    const response = await api.get('/admin/users/seller-requests');
    return response.data;
  },
  
  /**
   * Process a seller request (SuperAdmin only)
   * @param userId - User ID
   * @param status - APPROVED or REJECTED
   * @param notes - Optional notes about the decision
   */
  processSellerRequest: async (userId: number, status: string, notes?: string): Promise<any> => {
    const response = await api.post(`/admin/users/${userId}/seller-request`, { status, notes });
    return response.data;
  },
  
  /**
   * Change user role (SuperAdmin only)
   * @param userId - User ID
   * @param role - New role (CUSTOMER, SELLER, SUPERADMIN)
   */
  changeUserRole: async (userId: number, role: string): Promise<any> => {
    const response = await api.post(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
  
  /**
   * Get all products (filtered by user role)
   * SuperAdmin: all products
   * Seller: only their products
   */
  getAllProducts: async (): Promise<any> => {
    const response = await api.get('/admin/products');
    return response.data;
  },
  
  /**
   * Get all currency rates (SuperAdmin only)
   */
  getCurrencyRates: async (): Promise<any> => {
    const response = await api.get('/admin/currencies');
    return response.data;
  },
  
  /**
   * Update a single currency rate (SuperAdmin only)
   */
  updateCurrencyRate: async (currency: string, rate: number): Promise<any> => {
    const response = await api.post(`/admin/currencies/${currency}`, { rate });
    return response.data;
  },
  
  /**
   * Update multiple currency rates at once (SuperAdmin only)
   */
  updateCurrencyRates: async (rates: Record<string, number>): Promise<any> => {
    const response = await api.post('/admin/currencies', { rates });
    return response.data;
  },
  
  /**
   * Force refresh of exchange rates (SuperAdmin only)
   */
  refreshRates: async (): Promise<any> => {
    const response = await api.post('/admin/currencies/refresh');
    return response.data;
  }
};