// src/types/index.ts
export * from './shoe';
export * from './user';
export * from './order';
export * from './cart';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}