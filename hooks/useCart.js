// hooks/useCart.js
'use client';

import { getCart } from 'lib/swell';
import { useCallback, useEffect, useState } from 'react';

export function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get cartId from client-side cookie
      const cartId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('sessionToken='))
        ?.split('=')[1];

      if (cartId) {
        const cartData = await getCart(cartId);
        setCart(cartData);
      } else {
        setCart(null);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCart = useCallback(() => {
    fetchCart();
  }, [fetchCart]);

  const updateCartItem = useCallback(
    async (itemId, quantity) => {
      // Implement cart item update logic here
      // After updating, refresh the cart
      await refreshCart();
    },
    [refreshCart]
  );

  const removeCartItem = useCallback(
    async (itemId) => {
      // Implement cart item removal logic here
      // After removing, refresh the cart
      await refreshCart();
    },
    [refreshCart]
  );

  useEffect(() => {
    fetchCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [fetchCart, refreshCart]);

  return {
    cart,
    loading,
    error,
    refreshCart,
    updateCartItem,
    removeCartItem,
    quantity: cart?.items?.length || 0
  };
}
