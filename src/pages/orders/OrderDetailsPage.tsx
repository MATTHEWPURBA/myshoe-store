// src/pages/orders/OrderDetailsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { shoeApi } from '../../api/shoeApi';
import { paymentApi } from '../../api/paymentApi'; // Import the payment API
import { Order, OrderStatus, Shoe } from '../../types';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { config } from '../../config';
import { useNavigate } from 'react-router-dom';

// Declare the window interface to include Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}


const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { error: showError, success } = useToast();
  // Add this to your imports at the top
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [shoes, setShoes] = useState<{ [key: number]: Shoe }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  
  // Load Midtrans Snap script
  useEffect(() => {
    // Only load if not already loaded
    if (!document.getElementById('midtrans-snap')) {
      const script = document.createElement('script');
      script.id = 'midtrans-snap';
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
      document.body.appendChild(script);
    }
  }, []);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!id) throw new Error('No order ID provided');

      const orderData = await orderApi.getOrderById(parseInt(id));
      setOrder(orderData);

      // Fetch shoe details for each item
      const shoePromises = orderData.items.map((item) => shoeApi.getShoeById(item.shoeId));
      const shoeResults = await Promise.allSettled(shoePromises);
      
      const shoeMap: { [key: number]: Shoe } = {};
      shoeResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          const shoe = result.value;
          shoeMap[shoe.id] = shoe;
        }
      });

      setShoes(shoeMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
      showError(err.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setIsUpdating(true);
      await orderApi.deleteOrder(order.id);
      success('Order cancelled successfully');
      navigate('/orders');
    } catch (err: any) {
      showError(err.message || 'Failed to cancel order');
    } finally {
      setIsUpdating(false);
    }
  };

  // New method to pay for an order
  const handlePayOrder = async () => {
    if (!order) return;
    
    try {
      setIsPaymentLoading(true);
      
      // If the order already has a snap token, use it
      if (order.snapToken) {
        if (window.snap) {
          window.snap.pay(order.snapToken, {
            onSuccess: function(_result: any) {
              success('Payment successful!');
              fetchOrderDetails(); // Refresh order details
            },
            onPending: function(_result: any) {
              success('Payment pending. Please complete your payment.');
              fetchOrderDetails(); // Refresh order details
            },
            onError: function(_result: any) {
              showError('Payment failed. Please try again.');
              fetchOrderDetails(); // Refresh order details
            },
            onClose: function() {
              fetchOrderDetails(); // Refresh order details when popup closed
            }
          });
        } else {
          showError('Payment system is not available. Please try again later.');
        }
      } else {
        // Generate a new payment
        const paymentResponse = await paymentApi.generatePayment(order.id);
        
        if (paymentResponse.snapToken) {
          // Store the new snap token in the order object
          setOrder({
            ...order,
            snapToken: paymentResponse.snapToken,
            paymentUrl: paymentResponse.paymentUrl,
            status: 'WAITING_FOR_PAYMENT' as OrderStatus
          });
          
          // Open the Snap payment popup
          if (window.snap) {
            window.snap.pay(paymentResponse.snapToken, {
              onSuccess: function(_result: any) {
                success('Payment successful!');
                fetchOrderDetails(); // Refresh order details
              },
              onPending: function(_result: any) {
                success('Payment pending. Please complete your payment.');
                fetchOrderDetails(); // Refresh order details
              },
              onError: function(_result: any) {
                showError('Payment failed. Please try again.');
                fetchOrderDetails(); // Refresh order details
              },
              onClose: function() {
                fetchOrderDetails(); // Refresh order details when popup closed
              }
            });
          } else {
            // If Snap is not available, redirect to the payment URL
            if (paymentResponse.paymentUrl) {
              window.location.href = paymentResponse.paymentUrl;
            } else {
              showError('Payment system is not available. Please try again later.');
            }
          }
        } else {
          showError('Could not generate payment. Please try again.');
        }
      }
    } catch (err: any) {
      showError(err.message || 'Failed to process payment');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // New method to check payment status
  const handleCheckPaymentStatus = async () => {
    if (!order) return;
    
    try {
      setIsPaymentLoading(true);
      const statusResponse = await paymentApi.getPaymentStatus(order.id);
      
      // Refresh order details regardless of status
      fetchOrderDetails();
      
      // Show appropriate message based on status
      if (statusResponse.status === 'PAID') {
        success('Payment has been confirmed!');
      } else if (statusResponse.status === 'WAITING_FOR_PAYMENT') {
        success('Payment is still pending. Please complete your payment.');
      } else if (statusResponse.status === 'PAYMENT_FAILED') {
        showError('Payment failed. Please try again.');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to check payment status');
    } finally {
      setIsPaymentLoading(false);
    }
  };


  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PAID:
        return 'bg-green-100 text-green-800';
      case OrderStatus.WAITING_FOR_PAYMENT:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
      case OrderStatus.PAYMENT_FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
        <p>{error || 'Order not found'}</p>
        <Link to="/orders" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card title="Order Items">
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => {
                const shoe = shoes[item.shoeId];
                return (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden mr-4">
                      {shoe?.imageUrl ? (
                        <img src={shoe.imageUrl.startsWith('http') ? shoe.imageUrl : `${config.imageBaseUrl}/${shoe.imageUrl}`} alt={shoe.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      {shoe ? (
                        <Link to={`/shoes/${shoe.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                          {shoe.name}
                        </Link>
                      ) : (
                        <p className="text-lg font-medium">Shoe #{item.shoeId}</p>
                      )}

                      {shoe && (
                        <p className="text-gray-600">
                          {shoe.brand} | Size: {shoe.size} | {shoe.color}
                        </p>
                      )}

                      <div className="flex justify-between mt-1">
                        <p>
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div>
          <Card title="Order Summary">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-4">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Order Information</h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Last Updated:</span> {formatDate(order.updatedAt)}
              </p>
              {order.paymentMethod && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                </p>
              )}
              {order.paymentTime && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Time:</span> {formatDate(order.paymentTime)}
                </p>
              )}
            </div>

            {/* Payment and Order Action Buttons */}
            <div className="mt-6 space-y-3">
              {/* Show Pay Now button for orders that need payment */}
              {(order.status === 'PENDING' || order.status === 'WAITING_FOR_PAYMENT' || order.status === 'PAYMENT_FAILED') && (
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={handlePayOrder}
                  isLoading={isPaymentLoading}
                  disabled={isPaymentLoading}
                >
                  Pay Now
                </Button>
              )}
              
              {/* Show Check Payment Status button for orders awaiting payment */}
              {order.status === 'WAITING_FOR_PAYMENT' && (
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={handleCheckPaymentStatus}
                  isLoading={isPaymentLoading}
                  disabled={isPaymentLoading}
                >
                  Check Payment Status
                </Button>
              )}
              
              {/* Show Cancel Order button for pending orders */}
              {(order.status === 'PENDING' || order.status === 'WAITING_FOR_PAYMENT') && (
                <Button 
                  variant="danger" 
                  fullWidth 
                  onClick={handleCancelOrder}
                  isLoading={isUpdating}
                  disabled={isUpdating || isPaymentLoading}
                >
                  Cancel Order
                </Button>
              )}
              
              {/* Always show Back to Orders button */}
              <Link to="/orders">
                <Button variant="outline" fullWidth>
                  Back to Orders
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
