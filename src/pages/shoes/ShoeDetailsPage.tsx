// src/pages/shoes/ShoeDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { shoeApi } from '../../api/shoeApi';
import { Shoe } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { config } from '../../config';

const ShoeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, cart } = useCart();
  const { success, error: showError } = useToast();

  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchShoe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!id) throw new Error('No shoe ID provided');

        const data = await shoeApi.getShoeById(parseInt(id));
        setShoe(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load shoe details');
        showError(err.message || 'Failed to load shoe details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShoe();
  }, [id, showError]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(Math.max(1, Math.min(value || 1, shoe?.stock || 1)));
  };

  const handleAddToCart = () => {
      // Check if user is authenticated
  if (!isAuthenticated) {
    // Make sure shoe exists before using it in the navigation path
    if (shoe) {
      navigate('/login', { state: { from: { pathname: `/shoes/${shoe.id}` } } });
    } else {
      // Fallback if shoe is somehow null
      navigate('/login', { state: { from: { pathname: '/shoes' } } });
    }
    return;
  }

    if (shoe) {
      // Check current quantity in cart
      const currentInCart = cart.items.find((item) => item.shoe.id === shoe.id)?.quantity || 0;

      // Check if adding the selected quantity would exceed stock
      if (currentInCart + quantity > shoe.stock) {
        showError(`Cannot add ${quantity} more. Only ${shoe.stock - currentInCart} more available in stock.`);
        return;
      }

      addToCart(shoe, quantity);
      success(`Added ${quantity} ${shoe.name} to cart`);
    }
  };

  const handleDelete = async () => {
    if (!shoe || !window.confirm('Are you sure you want to delete this shoe?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await shoeApi.deleteShoe(shoe.id);
      success('Shoe deleted successfully');
      navigate('/shoes');
    } catch (err: any) {
      showError(err.message || 'Failed to delete shoe');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !shoe) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
        <p>{error || 'Shoe not found'}</p>
        <Link to="/shoes" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Shoes
        </Link>
      </div>
    );
  }

  // Calculate available stock considering what's already in cart
  const currentInCart = cart.items.find((item) => item.shoe.id === shoe.id)?.quantity || 0;
  const availableStock = shoe.stock - currentInCart;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="rounded-lg overflow-hidden shadow-md">
        {shoe.imageUrl ? (
          <img src={shoe.imageUrl.startsWith('http') ? shoe.imageUrl : `${config.imageBaseUrl}/${shoe.imageUrl}`} alt={shoe.name} className="w-full h-full object-cover" />
        ) : (
          <div className="h-full min-h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <Card>
        <h1 className="text-3xl font-bold mb-2">{shoe.name}</h1>
        <p className="text-xl text-blue-600 font-bold mb-4">${shoe.price.toFixed(2)}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-gray-600">Brand</span>
            <p className="font-medium">{shoe.brand}</p>
          </div>
          <div>
            <span className="text-gray-600">Color</span>
            <p className="font-medium">{shoe.color}</p>
          </div>
          <div>
            <span className="text-gray-600">Size</span>
            <p className="font-medium">{shoe.size}</p>
          </div>
          <div>
            <span className="text-gray-600">Stock</span>
            <p className="font-medium">{shoe.stock}</p>
          </div>
        </div>

        {currentInCart > 0 && (
          <div className="bg-blue-50 p-3 rounded-md mb-4">
            <p className="text-blue-700">
              {currentInCart} of this item already in your cart.
              {availableStock > 0 ? ` You can add ${availableStock} more.` : ' No more stock available.'}
            </p>
          </div>
        )}

        {shoe.description && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="text-gray-700">{shoe.description}</p>
          </div>
        )}

        {shoe.stock > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="mr-4">Quantity:</span>
              <input type="number" min="1" max={Math.min(shoe.stock, availableStock > 0 ? availableStock : shoe.stock)} value={quantity} onChange={handleQuantityChange} className="w-16 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={availableStock <= 0} />
            </div>

            <Button variant="primary" onClick={handleAddToCart} fullWidth disabled={availableStock <= 0}>
              {availableStock > 0 ? 'Add to Cart' : 'Maximum Stock Reached'}
            </Button>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
            <p>Out of Stock</p>
          </div>
        )}

        {isAuthenticated && (
          <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
            <Link to={`/shoes/edit/${shoe.id}`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} disabled={isDeleting}>
              Delete
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ShoeDetailsPage;
