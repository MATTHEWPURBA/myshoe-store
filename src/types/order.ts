import { Shoe } from "./shoe";

// src/types/order.ts
export enum OrderStatus {
    PENDING = 'PENDING',
    WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PAID = 'PAID',
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
    
    // Payment-related fields
    paymentId?: string;
    paymentUrl?: string;
    paymentMethod?: string;
    paymentTime?: string;
    snapToken?: string;

        // Add these fields
        currency?: string;
        exchangeRate?: number;
}

// Add this type for payment status responses
export interface PaymentStatus {
    orderId: number;
    status: OrderStatus;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentTime?: string;
    error?: string;
}

// Add this type for payment generation responses
export interface PaymentResponse {
    orderId: number;
    status: OrderStatus;
    paymentUrl?: string;
    snapToken?: string;
    error?: string;
}


// // Add this type for currency information
// export interface Currency {
//     code: string;
//     name: string;
//     rate: number;
// }