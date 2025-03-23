// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthUser, LoginCredentials, RegisterCredentials, ProfileUpdateData } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthResolved: boolean; // New state to indicate auth resolution
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterCredentials) => Promise<void>;
  logout: () => void;
    // Add this line to fix the error
    updateProfile: (data: ProfileUpdateData) => Promise<User | void>;
    error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthResolved: false, // Add to default context
  login: async () => {},
  register: async () => {},
  logout: () => {},
  // Add this line to match the interface
  updateProfile: async () => {},
  error: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthResolved, setIsAuthResolved] = useState(false); // Add new state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            // Set the user from localStorage
            setUser(JSON.parse(storedUser));

            // Option: You could validate the token here with a lightweight API call
            // to ensure it's still valid on the server
            // await authApi.validateToken();
          } catch (err) {
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } else {
          // Ensure user is set to null if no token
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        // Ensure user is null on error
        setUser(null);
      } finally {
        // Auth is now resolved regardless of the outcome
        setIsLoading(false);
        setIsAuthResolved(true);
      }
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

      // Update user state
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };


   // New method to update user profile
   const updateProfile = async (data: ProfileUpdateData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedUser = await authApi.updateProfile(data);
      
      // Update user in state and localStorage
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAuthResolved, // Expose the new state
        login,
        register,
        logout,
        updateProfile,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
