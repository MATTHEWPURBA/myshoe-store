// src/components/shoe/ShoeList.tsx
import React from 'react';
import { Shoe } from '../../types';
import ShoeCard from './ShoeCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface ShoeListProps {
  shoes: Shoe[];
  isLoading: boolean;
  error: Error | null;
}

const ShoeList: React.FC<ShoeListProps> = ({ shoes, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
        <p>Error loading shoes: {error.message}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (shoes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No shoes found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {shoes.map((shoe) => (
        <ShoeCard key={shoe.id} shoe={shoe} />
      ))}
    </div>
  );
};

export default ShoeList;
