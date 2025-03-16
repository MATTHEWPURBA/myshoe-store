// src/context/CartContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Shoe } from '../types';

interface CartContextType {
  cart: Cart;
  addToCart: (shoe: Shoe, quantity: number) => void;
  removeFromCart: (shoeId: number) => void;
  updateQuantity: (shoeId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

// Initial cart state
const initialCartState: Cart = { items: [], total: 0 };

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

  // Load cart from localStorage on initial render
  useEffect(() => {
    const loadCartFromLocalStorage = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);

          // Ensure the parsed cart has the expected structure
          if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
            setCart(parsedCart);

            // Calculate and set item count immediately from the loaded cart
            const count = parsedCart.items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
            setItemCount(count);
          }
        }
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        localStorage.removeItem('cart');
      } finally {
        setIsInitialized(true);
      }
    };

    loadCartFromLocalStorage();
  }, []); // Empty dependency array ensures this only runs once

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Only save to localStorage if the component has been initialized
    // This prevents overwriting the localStorage with empty state during initial mount
    if(isInitialized){
      localStorage.setItem('cart', JSON.stringify(cart));
      // Update item count whenever cart changes
      const count = cart.items.reduce((total, item) => total + item.quantity, 0);
      setItemCount(count);
    }
  }, [cart,isInitialized]);

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.shoe.price * item.quantity, 0);
  };

  const addToCart = (shoe: Shoe, quantity: number) => {
    setCart((prevCart) => {
      // Check if the item is already in the cart
      const existingItemIndex = prevCart.items.findIndex((item) => item.shoe.id === shoe.id);

      let newItems;

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item if it doesn't exist
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

  const clearCart = () => {
    setCart({ items: [], total: 0 });
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
