'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({
  cart: [],
  addToCart: () => {
    console.error("🚨 CRITICAL ERROR: CartProvider is missing!");
    alert("🚨 CRITICAL ERROR:\n\nThe CartProvider is NOT wrapping this component!\n\nThis means layout.js is not properly configured.\n\nData CANNOT be saved.");
  },
  removeFromCart: () => { },
  updateCartItem: () => { },
  clearCart: () => { },
  getCartItemCount: () => 0,
  cartItems: []
});

const STORAGE_KEY = 'yarn_b2b_cart';

export function CartProvider({ children }) {
  // 1. Initialize Empty (Server-Safe)
  const [cart, setCart] = useState([]);
  // 2. Use STATE for initialization status (triggers re-render when ready)
  const [isInitialized, setIsInitialized] = useState(false);

  // 3. LOAD Effect (Runs ONCE on Mount)
  useEffect(() => {
    console.log('🛒 CartProvider: MOUNTED');
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setCart(parsed);
          console.log(`✅ Cart LOADED from storage: ${parsed.length} items`);
        } else {
          console.log('ℹ️ Storage empty, starting fresh.');
        }
      } catch (e) {
        console.error('❌ Error parsing cart:', e);
      }
      // CRITICAL: Mark as initialized only after loading attempt finishes
      setIsInitialized(true);
    }
  }, []);

  // 4. SAVE Effect (Runs only when cart changes AND isInitialized is true)
  useEffect(() => {
    if (!isInitialized) {
      // 🛡️ BLOCKER: Do not save if we haven't finished loading yet!
      console.log('🛡️ BLOCKED: Save attempt prevented (not initialized yet)');
      return;
    }

    console.log(`💾 Saving cart to storage: ${cart.length} items`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, isInitialized]);

  // Actions
  const addToCart = (item) => {
    console.log('➕ Adding item to cart:', item);
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (id) => {
    console.log(`🗑️ Removing item from cart: ${id}`);
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    console.log('🧹 Clearing cart');
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  };

  const updateCartItem = (id, updatedFields) => {
    console.log(`✏️ Updating cart item ${id}:`, updatedFields);
    setCart((prev) => prev.map((item) => item.id === id ? { ...item, ...updatedFields } : item));
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartItems: cart,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      getCartItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);