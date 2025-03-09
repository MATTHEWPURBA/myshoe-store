// src/types/user.ts
export interface User {
    id: number;
    email: string;
    name: string;
    createdAt: string;
    updatedAt: string;
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