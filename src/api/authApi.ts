// src/api/authApi.ts
import api from './index';
import { AuthUser, LoginCredentials, RegisterCredentials, User, ProfileUpdateData } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterCredentials): Promise<AuthUser> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateData): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};