import React from 'react';
import { Shoe } from '../../types';
import { config } from '../../config';

interface ProductRecommendationProps {
  product: Shoe;
  onClick: () => void;
}

const ProductRecommendation: React.FC<ProductRecommendationProps> = ({ product, onClick }) => {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl.startsWith('http') ? product.imageUrl : `${config.imageBaseUrl}/${product.imageUrl}`} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500">${product.price.toFixed(2)} - {product.brand}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendation;