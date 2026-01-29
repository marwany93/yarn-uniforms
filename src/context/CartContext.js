'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
    // Initialize from localStorage using lazy initialization
    // This prevents hydration mismatches and reads localStorage only once
    const [cartItems, setCartItems] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedCart = localStorage.getItem('yarnUniformsCart');
                return savedCart ? JSON.parse(savedCart) : [];
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
                return [];
            }
        }
        return [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('yarnUniformsCart', JSON.stringify(cartItems));
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

