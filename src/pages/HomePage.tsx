// src/pages/HomePage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shoeApi } from '../api/shoeApi';
import { Shoe } from '../types';
import { useAsync } from '../hooks/useAsync';
import ShoeCard from '../components/shoe/ShoeCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useImagePreloader from '../hooks/useImagePreloader';

const HomePage: React.FC = () => {
  const {
    data: featuredShoes,
    isLoading,
    error,
    execute,
  } = useAsync<Shoe[]>();
  
  useEffect(() => {
    const fetchFeaturedShoes = async () => {
      // For the home page, we'll just fetch the first 4 shoes
      // In a real app, you might have a different API endpoint for featured products
      const allShoes = await shoeApi.getAllShoes();
      return allShoes.slice(0, 4);
    };
    
    execute(fetchFeaturedShoes);
  }, [execute]);
  

    // Preload featured shoe images when data is available
    const featuredImageUrls = featuredShoes?.map(shoe => shoe.imageUrl || '') || [];
    useImagePreloader(featuredImageUrls, { priority: 'high', width: 400, height: 300 });
  


  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Shoe Store</h1>
          <p className="text-xl mb-6">
            Find your perfect pair from our extensive collection of shoes.
            Quality footwear for every occasion.
          </p>
          <Link to="/shoes">
            <Button variant="primary" size="lg">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Shoes</h2>
          <Link to="/shoes" className="text-blue-600 hover:text-blue-800">
            View All →
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
            <p>Error loading featured shoes</p>
          </div>
        ) : featuredShoes && featuredShoes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredShoes.map((shoe) => (
              <ShoeCard key={shoe.id} shoe={shoe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No featured shoes available.</p>
            <Link to="/shoes">
              <Button variant="primary">Browse All Shoes</Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Categories Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* These would be dynamic categories in a real app */}
          <div className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Running</h3>
            <p className="text-gray-600 mb-4">
              High-performance shoes for serious runners
            </p>
            <Link
              to="/shoes?category=running"
              className="text-blue-600 hover:underline"
            >
              Shop Running
            </Link>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Casual</h3>
            <p className="text-gray-600 mb-4">
              Everyday comfort with stylish designs
            </p>
            <Link
              to="/shoes?category=casual"
              className="text-blue-600 hover:underline"
            >
              Shop Casual
            </Link>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Athletic</h3>
            <p className="text-gray-600 mb-4">
              Versatile shoes for various sports activities
            </p>
            <Link
              to="/shoes?category=athletic"
              className="text-blue-600 hover:underline"
            >
              Shop Athletic
            </Link>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-6 text-center hover:bg-gray-200 transition-colors">
            <h3 className="text-xl font-semibold mb-2">Formal</h3>
            <p className="text-gray-600 mb-4">
              Elegant shoes for professional settings
            </p>
            <Link
              to="/shoes?category=formal"
              className="text-blue-600 hover:underline"
            >
              Shop Formal
            </Link>
          </div>
        </div>
      </div>
      
      {/* Why Choose Us Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600">
              We offer only the highest quality shoes from trusted brands
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Quick shipping to get your new shoes to you as soon as possible
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
            <p className="text-gray-600">
              Multiple payment options with enhanced security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;