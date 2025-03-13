// src/pages/cart/CartPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { config } from '../../config';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (shoeId: number, quantity: number) => {
    updateQuantity(shoeId, quantity);
  };

  const handleRemoveItem = (shoeId: number) => {
    if (window.confirm('Remove this item from cart?')) {
      removeFromCart(shoeId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-500 mb-6">Your cart is empty.</p>
        <Link to="/shoes">
          <Button variant="primary">Browse Shoes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Button variant="outline" onClick={handleClearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <ul className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <li key={item.shoe.id} className="py-4 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden mr-4">
                    {item.shoe.imageUrl ? (
                      <img src={item.shoe.imageUrl.startsWith('http') ? item.shoe.imageUrl : `${config.imageBaseUrl}/${item.shoe.imageUrl}`} alt={item.shoe.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link to={`/shoes/${item.shoe.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                      {item.shoe.name}
                    </Link>
                    <p className="text-gray-600">
                      {item.shoe.brand} | Size: {item.shoe.size} | {item.shoe.color}
                    </p>
                    <p className="font-medium">${item.shoe.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-0">
                    <div className="flex items-center">
                      <button className="px-2 py-1 border border-gray-300 rounded-l" onClick={() => handleQuantityChange(item.shoe.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                        -
                      </button>
                      <input type="number" min="1" max={item.shoe.stock} value={item.quantity} onChange={(e) => handleQuantityChange(item.shoe.id, parseInt(e.target.value) || 1)} className="w-12 text-center border-t border-b border-gray-300 py-1" />
                      <button className="px-2 py-1 border border-gray-300 rounded-r" onClick={() => handleQuantityChange(item.shoe.id, item.quantity + 1)} disabled={item.quantity >= item.shoe.stock}>
                        +
                      </button>
                    </div>

                    <button onClick={() => handleRemoveItem(item.shoe.id)} className="text-red-500 hover:text-red-700 ml-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div>
          <Card title="Order Summary">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-4">
                <span>Total:</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>

              {isAuthenticated ? (
                <Link to="/checkout">
                  <Button variant="primary" fullWidth>
                    Proceed to Checkout
                  </Button>
                </Link>
              ) : (
                <Link to="/login" state={{ from: { pathname: '/checkout' } }}>
                  <Button variant="primary" fullWidth>
                    Login to Checkout
                  </Button>
                </Link>
              )}

              <Link to="/shoes">
                <Button variant="outline" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
