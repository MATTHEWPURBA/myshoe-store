import { Shoe } from "./shoe";

// src/types/order.ts
export enum OrderStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
  }
  
  export interface OrderItem {
    id: number;
    orderId: number;
    shoeId: number;
    quantity: number;
    price: number;
    shoe?: Shoe; // For frontend display purposes
  }
  
  export interface Order {
    id: number;
    userId: number;
    total: number;
    status: OrderStatus;
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
  }