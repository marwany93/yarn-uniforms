'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const CartContext = createContext({
    cart: [],
    addToCart: () => { },
    removeFromCart: () => { },
    clearCart: () => { },
    cartItems: []
});

const STORAGE_KEY = 'yarn_b2b_cart'; // Unified Key

export function CartProvider({ children }) {
    // 1. Initialize Empty (Server-Safe)
    const [cart, setCart] = useState([]);
    const isLoaded = useRef(false); // Track if initial load happened

    // 2. Load Data (Run ONCE on Mount)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setCart(JSON.parse(saved));
                    console.log('✅ Cart loaded:', JSON.parse(saved).length, 'items');
                } catch (e) {
                    console.error('Error parsing cart', e);
                }
            }
            isLoaded.current = true; // Mark as ready
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
        console.log('➕ Adding item:', item);
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

    return (
        <CartContext.Provider value={{ cart, cartItems: cart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
