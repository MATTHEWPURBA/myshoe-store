// src/pages/admin/ProductManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { shoeApi } from '../../api/shoeApi';
import { Shoe } from '../../types'; 
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { config } from '../../config';

const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Shoe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllProducts();
      setProducts(data);
    } catch (err: any) {
      showError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setIsDeleting(productId);
      await shoeApi.deleteShoe(productId);
      success('Product deleted successfully');
      
      // Remove from list
      setProducts(prev => prev.filter(product => product.id !== productId));
    } catch (err: any) {
      showError(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Link to="/shoes/add">
          <Button variant="primary">Add New Product</Button>
        </Link>
      </div>
      
      {products.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">No Products Found</h2>
            <p className="text-gray-500 mb-4">You haven't created any products yet.</p>
            <Link to="/shoes/add">
              <Button variant="primary">Create Your First Product</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {/* Product Image */}
              <div className="h-48 overflow-hidden bg-gray-200">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl.startsWith('http') ? product.imageUrl : `${config.imageBaseUrl}/${product.imageUrl}`} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{product.brand}</span>
                  <span className="text-blue-600 font-bold">${product.price.toFixed(2)}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    Size: {product.size}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    {product.color}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                    Stock: {product.stock}
                  </span>
                </div>
                
                {/* Created By (for SuperAdmin) */}
                {user?.role === 'SUPERADMIN' && product.creator && (
                  <div className="text-xs text-gray-500 mb-3">
                    Created by: {product.creator.name}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-between mt-2">
                  <Link to={`/shoes/${product.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <div className="space-x-2">
                    <Link to={`/shoes/edit/${product.id}`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      isLoading={isDeleting === product.id}
                      disabled={isDeleting !== null}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManagementPage;