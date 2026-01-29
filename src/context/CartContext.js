'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext({
  cart: [],
  addToCart: () => {
    console.error("🚨 CRITICAL ERROR: CartProvider is missing!");
    alert("🚨 CRITICAL ERROR:\n\nThe CartProvider is NOT wrapping this component!\n\nThis means layout.js is not properly configured.\n\nData CANNOT be saved.");
  },
  removeFromCart: () => { },
  clearCart: () => { },
  getCartItemCount: () => 0, // Placeholder
  cartItems: []
});

const STORAGE_KEY = 'yarn_b2b_cart';

export function CartProvider({ children }) {
  console.log('🛒 CartProvider: Component mounting...');

  // 1. Initialize Empty (Server-Safe)
  const [cart, setCart] = useState([]);
  const isLoaded = useRef(false);

  console.log('🛒 CartProvider: State initialized, cart length:', cart.length);

  // 2. Load Data (Run ONCE on Mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCart(parsed);
          console.log('✅ Cart loaded:', parsed.length, 'items');
        } catch (e) {
          console.error('Error parsing cart', e);
        }
      }
      isLoaded.current = true;
    }
  }, []);

  // 3. Save Data (Run on Update, BUT ONLY after loading)
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      console.log('💾 Cart saved:', cart.length, 'items');
    }
  }, [cart]);

  // Actions
  const addToCart = (item) => {
    console.log('➕ Adding item to cart:', item);
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ✅ THIS WAS MISSING: Helper to count total items
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  console.log('🛒 CartProvider: Rendering with cart length:', cart.length);

  return (
    <CartContext.Provider value={{
      cart,
      cartItems: cart,
      addToCart,
      removeFromCart,
      clearCart,
      getCartItemCount // <--- Added back here
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);