// src/layouts/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useToast } from '../hooks/useToast';

const MainLayout: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed position navbar */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <Navbar />
      </div>
      
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-md flex items-center justify-between max-w-xs ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : toast.type === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      
      {/* Add padding to the top of the main content to prevent it from being hidden behind the fixed navbar */}
      <main className="flex-grow pt-20"> {/* Increased padding-top from pt-16 to pt-20 for more space */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;