// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthUser, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const authData: AuthUser = await authApi.login(credentials);

      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      setUser(authData.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const authData: AuthUser = await authApi.register(userData);

      localStorage.setItem('token', authData.token);
      localStorage.setItem('user', JSON.stringify(authData.user));
      setUser(authData.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update the logout function:
  const logout = () => {
    try {
      // Attempt to clear cart on server before logging out
      authApi.logout();
      
      // Then clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart'); // Also clear cart from localStorage
      
      // Update user state
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
