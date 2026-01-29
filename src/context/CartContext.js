'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Create context with default value to prevent undefined errors
const CartContext = createContext({
    cart: [],
    cartItems: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    getCartTotal: () => 0,
    getCartItemCount: () => 0,
});

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Initialize with empty array to match server-side render
    // This prevents hydration mismatches
    const [cartItems, setCartItems] = useState([]);

    // Track if component has mounted to prevent overwriting localStorage with empty state
    const isMounted = useRef(false);

    // Load cart from localStorage AFTER component mounts (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('yarnUniformsCart');
            if (savedCart) {
                try {
                    setCartItems(JSON.parse(savedCart));
                } catch (error) {
                    console.error('Failed to load cart from localStorage:', error);
                }
            }
        }
        isMounted.current = true;
    }, []);

    // Save cart to localStorage whenever it changes
    // BUT skip the first render to avoid overwriting with empty array
    useEffect(() => {
        if (isMounted.current) {
            localStorage.setItem('yarnUniformsCart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            // Check if item already exists in cart
            const existingItemIndex = prevItems.findIndex(
                (cartItem) => cartItem.id === item.id
            );

            if (existingItemIndex > -1) {
                // Update quantity if item exists
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: (updatedItems[existingItemIndex].quantity || 1) + (item.quantity || 1),
                };
                return updatedItems;
            } else {
                // Add new item to cart
                return [...prevItems, { ...item, quantity: item.quantity || 1 }];
            }
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.price || 0) * (item.quantity || 1);
        }, 0);
    };

    const getCartItemCount = () => {
        return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
    };

    const value = {
        cart: cartItems,        // Alias for backward compatibility
        cartItems,              // Keep original name
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

