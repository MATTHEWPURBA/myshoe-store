// src/components/shoe/ShoeCard.tsx
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shoe } from '../../types';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
// import { config } from '../../config';
import Button from '../common/Button';
import LazyImage from '../common/LazyImage';

interface ShoeCardProps {
  shoe: Shoe;
}

const ShoeCard: React.FC<ShoeCardProps> = ({ shoe }) => {
  const { addToCart,cart } = useCart();
  const { error: showError } = useToast();


  const handleAddToCart = useCallback(() => {
      // Find current quantity in cart (using shoe.id to ensure proper match)
      const currentItem = cart.items.find(item => item.shoe.id === shoe.id);
      const currentInCart = currentItem?.quantity || 0;
      
      console.log('Current in cart:', currentInCart);
      console.log('Available stock:', shoe.stock);

      

      // Check if adding one more would exceed stock
      if (currentInCart + 1 > shoe.stock) {
        console.log('Stock limit reached!');
        showError(`Cannot add more. Only ${shoe.stock} items available in stock (${currentInCart} already in cart).`);
        return;
      }

      console.log('Adding item to cart...');

    addToCart(shoe, 1);
  }, [addToCart, cart.items, shoe, showError]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
      <Link to={`/shoes/${shoe.id}`}>
        <div className="h-48 overflow-hidden">
          {shoe.imageUrl ? (
            // <img src={shoe.imageUrl.startsWith('http') ? shoe.imageUrl : `${config.imageBaseUrl}/${shoe.imageUrl}`}
            // alt={shoe.name}
            // className="w-full h-full object-cover" />
            <LazyImage src={shoe.imageUrl || ''} alt={shoe.name} className="w-full h-full" width={400} height={300} placeholderType="shoe" />
          ) : (
            <div className="h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 truncate">{shoe.name}</h3>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">{shoe.brand}</span>
            <span className="text-blue-600 font-bold">${shoe.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <span className="mr-2">Size: {shoe.size}</span>
            <span>Color: {shoe.color}</span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button variant="primary" fullWidth onClick={handleAddToCart} disabled={shoe.stock <= 0}>
          {shoe.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};

export default ShoeCard;
