// src/pages/admin/DashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shoeApi } from '../../api/shoeApi';
import { orderApi } from '../../api/orderApi';
import { Shoe, Order } from '../../types';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { data: shoes, isLoading: loadingShoes, execute: fetchShoes } = useAsync<Shoe[]>();
  const { data: orders, isLoading: loadingOrders, execute: fetchOrders } = useAsync<Order[]>();
  const { error: showError } = useToast();
  
  const [inventoryValue, setInventoryValue] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await fetchShoes(() => shoeApi.getAllShoes());
        await fetchOrders(() => orderApi.getAllOrders());
      } catch (err: any) {
        showError('Failed to load dashboard data');
      }
    };
    
    loadDashboardData();
  }, [fetchShoes, fetchOrders, showError]);
  
  useEffect(() => {
    if (shoes) {
      // Calculate total inventory value
      const value = shoes.reduce((sum, shoe) => {
        return sum + (shoe.price * shoe.stock);
      }, 0);
      setInventoryValue(value);
    }
  }, [shoes]);
  
  useEffect(() => {
    if (orders) {
      // Calculate total sales
      const sales = orders.reduce((sum, order) => {
        return sum + order.total;
      }, 0);
      setTotalSales(sales);
    }
  }, [orders]);
  
  if (loadingShoes || loadingOrders) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-medium mb-2">Products</h3>
          <p className="text-3xl font-bold">{shoes?.length || 0}</p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium mb-2">Total Inventory Value</h3>
          <p className="text-3xl font-bold">${inventoryValue.toFixed(2)}</p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium mb-2">Total Sales</h3>
          <p className="text-3xl font-bold">${totalSales.toFixed(2)}</p>
        </Card>
      </div>
      
      {/* Recent Orders Section */}
      <Card title="Recent Orders" className="mb-8">
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Order ID</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-2 px-4">#{order.id}</td>
                    <td className="py-2 px-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium
                        ${order.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2 px-4">${order.total.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No orders yet</p>
        )}
        
        <div className="mt-4 flex justify-end">
          <Link to="/orders">
            <Button variant="outline">View All Orders</Button>
          </Link>
        </div>
      </Card>
      
      {/* Low Stock Products Section */}
      <Card title="Low Stock Products">
        {shoes && shoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">ID</th>
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Brand</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Stock</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shoes
                  .filter(shoe => shoe.stock < 10)
                  .slice(0, 5)
                  .map((shoe) => (
                    <tr key={shoe.id} className="border-b">
                      <td className="py-2 px-4">#{shoe.id}</td>
                      <td className="py-2 px-4">{shoe.name}</td>
                      <td className="py-2 px-4">{shoe.brand}</td>
                      <td className="py-2 px-4">${shoe.price.toFixed(2)}</td>
                      <td className="py-2 px-4 font-medium text-red-600">{shoe.stock}</td>
                      <td className="py-2 px-4">
                        <Link to={`/shoes/edit/${shoe.id}`} className="text-blue-600 hover:underline">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No low stock products</p>
        )}
        
        <div className="mt-4 flex justify-end">
          <Link to="/shoes/add">
            <Button variant="primary">Add New Shoe</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;