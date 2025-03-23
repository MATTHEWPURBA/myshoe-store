// src/types/shoe.ts
export interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  size: number;
  color: string;
  stock: number;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
    // Add these properties
    createdBy?: number;
    creator?: {
      id: number;
      name: string;
      email?: string;
    };
}

export type ShoeFilters = {
  brand?: string;
  size?: number;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ShoeFormData = Omit<Shoe, 'id' | 'createdAt' | 'updatedAt'>;