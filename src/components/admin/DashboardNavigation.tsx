// src/components/admin/DashboardNavigation.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardNavigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const linkClass = (path: string) => `
    flex items-center px-4 py-2 text-sm font-medium rounded-md
    ${isActive(path) 
      ? 'bg-gray-100 text-blue-600' 
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
  `;
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
        
        <nav className="mt-5 space-y-1">
          {/* Common for Sellers and SuperAdmins */}
          <NavLink to="/admin/products" className={linkClass('/admin/products')}>
            Products
          </NavLink>
          
          {/* SuperAdmin only links */}
          {user.role === 'SUPERADMIN' && (
            <>
              <NavLink to="/admin/users" className={linkClass('/admin/users')}>
                User Management
              </NavLink>
              
              <NavLink to="/admin/seller-requests" className={linkClass('/admin/seller-requests')}>
                Seller Requests
              </NavLink>
              
              <NavLink to="/admin/currencies" className={linkClass('/admin/currencies')}>
                Currency Management
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default DashboardNavigation;