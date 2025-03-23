// src/pages/checkout/CheckoutPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { orderApi } from '../../api/orderApi';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { config } from '../../config';

type PaymentMethod = 'credit_card' | 'paypal';
type ShippingMethod = 'standard' | 'express';

interface CheckoutForm {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
}

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CheckoutForm>({
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    paymentMethod: 'credit_card',
    shippingMethod: 'standard',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<CheckoutForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const validateForm = (): boolean => {
    const errors: Partial<CheckoutForm> = {};
    
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.zip.trim()) errors.zip = 'Zip code is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (cart.items.length === 0) {
      error('Your cart is empty');
      return;
    }

      // Make sure user is authenticated
    if (!user || !user.id) {
      error('You must be logged in to place an order');
      navigate('/login');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
    // Calculate shipping fee based on selected method
    const shippingFee = formData.shippingMethod === 'express' ? 15 : 0;
    
        // Calculate the final total including shipping
        const finalTotal = cart.total + shippingFee;
    
    // Create the order with shipping information
    const order = await orderApi.createOrder(
      cart.items,
      user.id,
      finalTotal,
      {
        shippingMethod: formData.shippingMethod,
        shippingFee: shippingFee
      }
    );
    
      // Clear the cart after successful order
      clearCart();

      
      // Show success message
      success('Order placed successfully!');
      
      // Navigate to order details page
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-500 mb-6">Your cart is empty. Add some items to checkout.</p>
        <Button
          variant="primary"
          onClick={() => navigate('/shoes')}
        >
          Browse Shoes
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Shipping Information">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={formErrors.address}
                    fullWidth
                    required
                  />
                </div>
                
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  error={formErrors.city}
                  fullWidth
                  required
                />
                
                <Input
                  label="State/Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  error={formErrors.state}
                  fullWidth
                  required
                />
                
                <Input
                  label="Zip/Postal Code"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  error={formErrors.zip}
                  fullWidth
                  required
                />
                
                <Input
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  error={formErrors.country}
                  fullWidth
                  required
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={formData.paymentMethod === 'credit_card'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Credit Card
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    PayPal
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Shipping Method</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Standard Shipping (Free, 3-5 business days)
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={formData.shippingMethod === 'express'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Express Shipping ($15, 1-2 business days)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Place Order
                </Button>
              </div>
            </form>
          </Card>
        </div>
        
        <div>
          <Card title="Order Summary">
            <ul className="divide-y divide-gray-200 mb-4">
              {cart.items.map((item) => (
                <li key={item.shoe.id} className="py-3 flex">
                  <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden mr-3">
                    {item.shoe.imageUrl ? (
                      <img
                        src={
                          item.shoe.imageUrl.startsWith('http')
                            ? item.shoe.imageUrl
                            : `${config.imageBaseUrl}/${item.shoe.imageUrl}`
                        }
                        alt={item.shoe.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.shoe.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {item.shoe.size} | Qty: {item.quantity}
                    </p>
                  </div>
                  
                  <div className="ml-3">
                    <p className="font-medium">
                      ${(item.shoe.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {formData.shippingMethod === 'express' ? '$15.00' : 'Free'}
                </span>
              </div>
              
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>
                  $
                  {(
                    cart.total +
                    (formData.shippingMethod === 'express' ? 15 : 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
          
          <div className="mt-4">
            <Card>
              <div className="text-sm">
                <p className="font-medium">Customer Information</p>
                <p className="mt-1">{user?.name}</p>
                <p>{user?.email}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;