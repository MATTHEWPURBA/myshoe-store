// src/routes.tsx
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Shoe Pages
const ShoesPage = lazy(() => import('./pages/shoes/ShoesPage'));
const ShoeDetailsPage = lazy(() => import('./pages/shoes/ShoeDetailsPage'));
const AddShoePage = lazy(() => import('./pages/shoes/AddShoePage'));
const EditShoePage = lazy(() => import('./pages/shoes/EditShoePage'));

// Order Pages
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/orders/OrderDetailsPage'));

// Cart & Checkout
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));

// Other Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));

// Admin Pages
const ProductManagementPage = lazy(() => import('./pages/admin/ProductManagementPage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const SellerRequestsPage = lazy(() => import('./pages/admin/SellerRequestsPage'));
const ExchangeRatesPage = lazy(() => import('./pages/admin/ExchangeRatesPage'));

// User Pages
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const BecomeSellerPage = lazy(() => import('./pages/user/BecomeSellerPage'));


// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Admin route wrapper
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Check if user is admin (you may want to add an isAdmin field to the User type)
  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};


// Seller route wrapper
const SellerRoute = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || (user.role !== 'SELLER' && user.role !== 'SUPERADMIN')) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// SuperAdmin route wrapper
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || user.role !== 'SUPERADMIN') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'register',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <RegisterPage />
          </Suspense>
        ),
      },
      


      




      {
        path: 'shoes',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ShoesPage />
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ShoeDetailsPage />
              </Suspense>
            ),
          },
          {
            path: 'add',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ProtectedRoute>
                  <AddShoePage />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ProtectedRoute>
                  <EditShoePage />
                </ProtectedRoute>
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              </Suspense>
            ),
          },
          {
            path: ':id',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <ProtectedRoute>
                  <OrderDetailsPage />
                </ProtectedRoute>
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'cart',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: 'checkout',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NotFoundPage />
          </Suspense>
        ),
      },

      // New User routes
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: 'become-seller',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProtectedRoute>
              <BecomeSellerPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
    ],
  },

// Admin dashboard routes
  {
    path: '/admin',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/products" replace />,
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SellerRoute>
              <ProductManagementPage />
            </SellerRoute>
          </Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SuperAdminRoute>
              <UserManagementPage />
            </SuperAdminRoute>
          </Suspense>
        ),
      },
      {
        path: 'seller-requests',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SuperAdminRoute>
              <SellerRequestsPage />
            </SuperAdminRoute>
          </Suspense>
        ),
      },
      {
        path: 'currencies',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SuperAdminRoute>
              <ExchangeRatesPage />
            </SuperAdminRoute>
          </Suspense>
        ),
      },
    ],
  },


];

export const router = createBrowserRouter(routes);
