// src/layouts/DashboardLayout.tsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DashboardNavigation from '../components/admin/DashboardNavigation';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if not a seller or superadmin
  if (user && user.role !== 'SELLER' && user.role !== 'SUPERADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <DashboardNavigation />
        </div>
        
        {/* Main Content Area */}
        <div className="md:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;