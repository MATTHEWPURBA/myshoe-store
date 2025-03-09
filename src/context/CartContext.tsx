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

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        
        // Calculate item count
        const count = parsedCart.items.reduce(
          (total: number, item: CartItem) => total + item.quantity,
          0
        );
        setItemCount(count);
      } catch (error) {
        console.error('Failed to parse cart from localStorage', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update item count
    const count = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    setItemCount(count);
  }, [cart]);

  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce(
      (sum, item) => sum + item.shoe.price * item.quantity,
      0
    );
  };

  const addToCart = (shoe: Shoe, quantity: number) => {
    setCart((prevCart) => {
      // Check if the item is already in the cart
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.shoe.id === shoe.id
      );

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
      const newItems = prevCart.items.map((item) =>
        item.shoe.id === shoeId ? { ...item, quantity } : item
      );
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