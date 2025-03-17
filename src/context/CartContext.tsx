// src/context/CartContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Shoe } from '../types';
import { useAuth } from '../hooks/useAuth';
import { cartApi } from '../api/cartApi';

interface CartContextType {
  cart: Cart;
  addToCart: (shoe: Shoe, quantity: number) => void;
  removeFromCart: (shoeId: number) => void;
  updateQuantity: (shoeId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

// Initial cart state
// const initialCartState: Cart = { items: [], total: 0 };

export const CartContext = createContext<CartContextType>({
  cart: { items: [], total: 0 },
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [itemCount, setItemCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.shoe.price * item.quantity, 0);
  };

  // Load cart based on authentication state
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && user?.id) {
        try {
          // For authenticated users, try to load cart from server
          const serverItems = await cartApi.getUserCart();

          // If successful, set cart state from server data
          setCart({
            items: serverItems,
            total: calculateTotal(serverItems),
          });

          // Update localStorage with server data
          localStorage.setItem(
            'cart',
            JSON.stringify({
              items: serverItems,
              total: calculateTotal(serverItems),
            })
          );
        } catch (error) {
          console.error('Failed to load cart from server', error);
          // Fallback to localStorage if server request fails
          loadCartFromLocalStorage();
        }
      } else {
        // For unauthenticated users, reset cart
        setCart({ items: [], total: 0 });
        localStorage.removeItem('cart');
      }

      // Mark initialization as complete
      setIsInitialized(true);
    };

    // Helper function to load cart from localStorage
    const loadCartFromLocalStorage = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);

          // Ensure the parsed cart has the expected structure
          if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
            setCart(parsedCart);

            // Calculate and set item count
            const count = parsedCart.items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
            setItemCount(count);
          }
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        localStorage.removeItem('cart');
      }
    };

    loadCart();
  }, [isAuthenticated, user?.id]); // Re-run when auth state changes

  // Sync cart changes with server and update localStorage
  useEffect(() => {
    // Only proceed if initialized to prevent overwriting with empty state
    if (!isInitialized) return;

    // Update item count whenever cart changes
    const count = cart.items.reduce((total, item) => total + item.quantity, 0);
    setItemCount(count);

    // For authenticated users
    if (isAuthenticated) {
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // Sync with server if there are items
      if (cart.items.length > 0) {
        // Use fire-and-forget pattern to not block UI
        cartApi.syncCart(cart.items).catch((err) => {
          console.error('Failed to sync cart with server', err);
        });
      } else if (cart.items.length === 0) {
        // If cart is empty, clear on server too
        cartApi.clearCart().catch((err) => {
          console.error('Failed to clear cart on server', err);
        });
      }
    } else {
      // Don't save cart for unauthenticated users
      localStorage.removeItem('cart');
    }
  }, [cart, isInitialized, isAuthenticated]);

  // Add item to cart
  const addToCart = (shoe: Shoe, quantity: number) => {
    // If not authenticated, don't allow adding to cart
    if (!isAuthenticated) {
      return;
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex((item) => item.shoe.id === shoe.id);

      let newItems;

      if (existingItemIndex > -1) {
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        newItems = [...prevCart.items, { shoe, quantity }];
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  const removeFromCart = (shoeId: number) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.shoe.id !== shoeId);
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  const updateQuantity = (shoeId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(shoeId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) => (item.shoe.id === shoeId ? { ...item, quantity } : item));
      return {
        items: newItems,
        total: calculateTotal(newItems),
      };
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart({ items: [], total: 0 });
    
    if (isAuthenticated) {
      cartApi.clearCart().catch(err => {
        console.error('Failed to clear cart on server', err);
      });
    }
  };


  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
