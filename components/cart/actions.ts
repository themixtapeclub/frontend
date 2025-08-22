// components/cart/actions.ts

'use server';

import type { SwellCartItemOptionInput } from "lib/commerce/swell/client";
import { addToCart, removeFromCart, updateCart } from "lib/commerce/swell/client";
import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

export const addItem = async (
  productId: string | undefined,
  options: SwellCartItemOptionInput[] | undefined
): Promise<Error | undefined> => {
  const cartId = (await cookies()).get('sessionToken')?.value;

  if (!productId) {
    return new Error('Missing variantId');
  }

  try {
    const data = await addToCart({ quantity: 1, productId, options } as any);

    revalidateTag('cart');

    return undefined;
  } catch (e) {
    return new Error('Error adding item');
  }
};

export const removeItem = async (itemId: string): Promise<Error | undefined> => {
  const cartId = (await cookies()).get('sessionToken')?.value;

  if (!cartId) {
    return new Error('Missing cartId');
  }

  try {
    await removeFromCart(itemId);
    revalidateTag('cart');
    return undefined;
  } catch (e) {
    return new Error('Error removing item');
  }
};

export const updateItemQuantity = async ({
  itemId,
  quantity
}: {
  itemId: string;
  quantity: number;
}): Promise<Error | undefined> => {
  const cartId = (await cookies()).get('sessionToken')?.value;

  if (!cartId) {
    return new Error('Missing cartId');
  }

  try {
    await updateCart(cartId, quantity);
    revalidateTag('cart');
    return undefined;
  } catch (e) {
    return new Error('Error updating item quantity');
  }
};
