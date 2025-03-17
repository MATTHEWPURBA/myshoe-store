import { Shoe } from './shoe';

// src/types/cart.ts
export interface CartItem {
  shoe: Shoe;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
