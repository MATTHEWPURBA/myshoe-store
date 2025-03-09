// src/pages/orders/OrdersPage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orderApi';
import { Order, OrderStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAsync } from '../../hooks/useAsync';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrdersPage: React.FC = () => {
  const { data: orders, isLoading, error, execute } = useAsync<Order[]>();
  const { error: showError } = useToast();
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        await execute(() => orderApi.getAllOrders());
      } catch (err: any) {
        showError(err.message || 'Failed to load orders');
      }
    };
    
    fetchOrders();
  }, [execute, showError]);
  
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PAID:
        return 'bg-green-100 text-green-800';
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
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
        <p>Error loading orders: {error.message}</p>
        <p>Please try again later.</p>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">My Orders</h1>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <Link
          to="/shoes"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Browse Shoes
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">
                  Order #{order.id} • {formatDate(order.createdAt)}
                </p>
                <p className="font-medium">${order.total.toFixed(2)}</p>
              </div>
              
              <div className="mt-2 md:mt-0 flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium mb-2">Items</h3>
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    <span className="font-medium">{item.quantity}x</span> Shoe #{item.shoeId} - ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;