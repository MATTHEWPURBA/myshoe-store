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
  // const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, user, isAuthResolved } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.shoe.price * item.quantity, 0);
  };

  // Load cart based on authentication state
  useEffect(() => {
    // Don't do anything until auth is fully resolved
    if (!isInitialized) {
      // Wait for auth to be fully established
      if (isAuthenticated === true || isAuthenticated === false) {
        setIsInitialized(true);
      }
      return;
    }

    const loadCart = async () => {
      // Reset cart for unauthenticated users
      if (!isAuthenticated || !user?.id) {
        setCart({ items: [], total: 0 });
        setItemCount(0);
        return;
      }
      try {
        // For authenticated users, try to load cart from server
        const serverItems = await cartApi.getUserCart();

        // If successful, set cart state from server data
        setCart({
          items: serverItems,
          total: calculateTotal(serverItems),
        });

        // Update item count
        const count = serverItems.reduce((total, item) => total + item.quantity, 0);
        setItemCount(count);
      } catch (error) {
        console.error('Failed to load cart from server', error);
        // Set empty cart on error
        setCart({ items: [], total: 0 });
        setItemCount(0);
      }
    };
    loadCart();
  }, [isAuthenticated, user?.id, isAuthResolved,isInitialized]); // Add isAuthResolved to dependencies

  // Helper function to load cart from localStorage
  //   const loadCartFromLocalStorage = () => {
  //     try {
  //       const savedCart = localStorage.getItem('cart');
  //       if (savedCart) {
  //         const parsedCart = JSON.parse(savedCart);

  //         // Ensure the parsed cart has the expected structure
  //         if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
  //           setCart(parsedCart);

  //           // Calculate and set item count
  //           const count = parsedCart.items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  //           setItemCount(count);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Failed to parse cart from localStorage', error);
  //       localStorage.removeItem('cart');
  //     }
  //   };

  //   loadCart();
  // }, [isAuthenticated, user?.id]); // Re-run when auth state changes

  // Sync cart changes with server and update localStorage
  // useEffect(() => {
  //   // Only proceed if initialized to prevent overwriting with empty state
  //   if (!isInitialized) return;

  //   // Update item count whenever cart changes
  //   const count = cart.items.reduce((total, item) => total + item.quantity, 0);
  //   setItemCount(count);

  //   // For authenticated users
  //   if (isAuthenticated) {
  //     // Save to localStorage
  //     localStorage.setItem('cart', JSON.stringify(cart));

  //     // Sync with server if there are items
  //     if (cart.items.length > 0) {
  //       // Use fire-and-forget pattern to not block UI
  //       cartApi.syncCart(cart.items).catch((err) => {
  //         console.error('Failed to sync cart with server', err);
  //       });
  //     } else if (cart.items.length === 0) {
  //       // If cart is empty, clear on server too
  //       cartApi.clearCart().catch((err) => {
  //         console.error('Failed to clear cart on server', err);
  //       });
  //     }
  //   } else {
  //     // Don't save cart for unauthenticated users
  //     localStorage.removeItem('cart');
  //   }
  // }, [cart, isInitialized, isAuthenticated]);

  // Add item to cart
  // const addToCart = async (shoe: Shoe, quantity: number) => {
  //   // If not authenticated, don't allow adding to cart
  //   if (!isAuthenticated) {
  //     return;
  //   }
  //   try {
  //     setCart((prevCart) => {
  //       const existingItemIndex = prevCart.items.findIndex((item) => item.shoe.id === shoe.id);

  //       let newItems;

  //       if (existingItemIndex > -1) {
  //         newItems = [...prevCart.items];
  //         newItems[existingItemIndex] = {
  //           ...newItems[existingItemIndex],
  //           quantity: newItems[existingItemIndex].quantity + quantity,
  //         };
  //       } else {
  //         newItems = [...prevCart.items, { shoe, quantity }];
  //       }

  //       // Update item count
  //       const newCount = newItems.reduce((total, item) => total + item.quantity, 0);
  //       setItemCount(newCount);

  //       return {
  //         items: newItems,
  //         total: calculateTotal(newItems),
  //       };
  //     });

  //     // Then sync with server
  //     await cartApi.syncCart(cart.items);
  //   } catch (error) {
  //     console.error('Failed to add item to cart', error);
  //   }
  // };

  const addToCart = async (shoe: Shoe, quantity: number) => {
    if (!isAuthenticated) return;

    try {
      // Calculate the new items first
      const existingItemIndex = cart.items.findIndex((item) => item.shoe.id === shoe.id);
      let newItems;

      if (existingItemIndex > -1) {
        newItems = [...cart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        newItems = [...cart.items, { shoe, quantity }];
      }

      // Update local state for immediate feedback
      setCart({
        items: newItems,
        total: calculateTotal(newItems),
      });

      // Sync with server using new items
      const serverItems = await cartApi.syncCart(newItems);

      // Update state again with server response to ensure consistency
      setCart({
        items: serverItems,
        total: calculateTotal(serverItems),
      });

      // Update item count based on server's data
      const serverCount = serverItems.reduce((total, item) => total + item.quantity, 0);
      setItemCount(serverCount);
    } catch (error) {
      console.error('Failed to add item to cart', error);
    }
  };

  const removeFromCart = async (shoeId: number) => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    try {
      setCart((prevCart) => {
        const newItems = prevCart.items.filter((item) => item.shoe.id !== shoeId);

        // Update item count
        const newCount = newItems.reduce((total, item) => total + item.quantity, 0);
        setItemCount(newCount);
        return {
          items: newItems,
          total: calculateTotal(newItems),
        };
      });
      // Sync with server
      await cartApi.syncCart(cart.items.filter((item) => item.shoe.id !== shoeId));
    } catch (error) {
      console.error('Failed to remove item from cart', error);
    }
  };

  const updateQuantity = async (shoeId: number, quantity: number) => {
    if (!isAuthenticated || !user?.id) {
      return;
    }
    if (quantity <= 0) {
      removeFromCart(shoeId);
      return;
    }

    try {
      setCart((prevCart) => {
        const newItems = prevCart.items.map((item) => (item.shoe.id === shoeId ? { ...item, quantity } : item));
        // Update item count
        const newCount = newItems.reduce((total, item) => total + item.quantity, 0);
        setItemCount(newCount);
        return {
          items: newItems,
          total: calculateTotal(newItems),
        };
      });

      // Sync with server
      await cartApi.syncCart(cart.items.map((item) => (item.shoe.id === shoeId ? { ...item, quantity } : item)));
    } catch (error) {
      console.error('Failed to update item quantity', error);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    try {
      // Clear local state
      setCart({ items: [], total: 0 });
      setItemCount(0);

      // Clear on server
      await cartApi.clearCart();
    } catch (error) {
      console.error('Failed to clear cart', error);
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
