// src/types/user.ts
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  
  // Add these new fields
  role?: string;
  sellerRequestStatus?: string | null;
  sellerRequestDate?: string | null;
  sellerRequestInfo?: string | null;
}

export interface AuthUser {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// Add this for profile updates
export interface ProfileUpdateData {
  name?: string;
  email?: string;
}

// Add this for seller requests
export interface SellerRequestData {
  reason: string;
  businessInfo?: string;
}

// Add this to define available user roles
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  SUPERADMIN = 'SUPERADMIN'
}