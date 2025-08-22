// components/cart/index.tsx

'use client';

import { getCart } from "lib/commerce/swell/client";
import { useEffect, useState } from 'react';
import CartModal from './modal';

export default function Cart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleCartUpdate = () => {
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return <CartModal cart={cart} loading={loading} onRefresh={refreshCart} />;
}
