// components/cart/modal.tsx

'use client';

import { Dialog, Transition } from '@headlessui/react';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import CloseCart from 'components/cart/close-cart';
import OpenCart from 'components/cart/open-cart';
import Price from 'components/ui/price';
import { SwellCart, removeCartItem, updateCartItem } from 'lib/commerce/swell/client';
import { DEFAULT_OPTION } from 'lib/shared/constants/global';
import { createUrl } from 'lib/utils/core';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartModal({
  cart,
  loading,
  onRefresh
}: {
  cart: SwellCart | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.items?.length || 0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollPositionRef = useRef(0);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const cartItems = cart?.items || [];
  const itemCount = cart?.item_quantity || 0;

  useEffect(() => {
    if (!loading && !hasInitialized) {
      setHasInitialized(true);
      quantityRef.current = cartItems.length;
      return;
    }

    if (hasInitialized && cartItems.length !== quantityRef.current) {
      if (cartItems.length > quantityRef.current && !isOpen) {
        setIsOpen(true);
      }

      quantityRef.current = cartItems.length;
    }
  }, [loading, hasInitialized, isOpen, cartItems.length]);

  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

      // Prevent scrolling on body but maintain scroll position
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      document.body.classList.add('cart-modal-open');
    } else {
      // Restore scroll position and remove fixed positioning
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('cart-modal-open');

      // Restore scroll position only if we had stored one
      if (scrollPositionRef.current > 0) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollPositionRef.current);
        });
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.classList.remove('cart-modal-open');
    };
  }, [isOpen]);

  return (
    <>
      <button aria-label="Open cart" onClick={openCart} className="d-flex outline">
        <OpenCart quantity={itemCount} />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeCart} className="relative z-[9999]">
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed bottom-0 right-0 top-0 flex h-full w-full flex-col border-l border-neutral-200 bg-white p-6 text-black md:w-[390px] dark:border-neutral-700 dark:bg-black dark:text-white">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">My Cart</p>

                <button aria-label="Close cart" onClick={closeCart}>
                  <CloseCart />
                </button>
              </div>

              {loading ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-center text-lg">Loading cart...</p>
                </div>
              ) : !cart || cartItems.length === 0 ? (
                <div className="mt-20 flex w-full flex-col items-center justify-center overflow-hidden">
                  <ShoppingCartIcon className="h-16" />
                  <p className="mt-6 text-center text-2xl font-bold">Your cart is empty.</p>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-between overflow-hidden p-1">
                  <ul className="flex-grow overflow-auto py-0">
                    {cartItems.map((item, i) => {
                      const merchandiseSearchParams = {} as MerchandiseSearchParams;

                      const options = item.options || [];
                      options.forEach((option) => {
                        if (option.value && option.value !== DEFAULT_OPTION) {
                          merchandiseSearchParams[option.name.toLowerCase()] = option.value;
                        }
                      });

                      const merchandiseUrl = createUrl(
                        `/product/${item.product?.slug || ''}`,
                        new URLSearchParams(merchandiseSearchParams)
                      );

                      return (
                        <li
                          key={item.id || i}
                          className="flex w-full flex-col border-b border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                          onMouseEnter={(e) => {
                            const deleteBtn = e.currentTarget.querySelector(
                              '.delete-button'
                            ) as HTMLElement;
                            if (deleteBtn) deleteBtn.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            const deleteBtn = e.currentTarget.querySelector(
                              '.delete-button'
                            ) as HTMLElement;
                            if (deleteBtn) deleteBtn.style.opacity = '0';
                          }}
                        >
                          <div className="relative flex w-full flex-row justify-between px-0 py-2">
                            <div
                              className="delete-button absolute left-12 top-2 z-50 transition-opacity duration-200"
                              style={{ opacity: 0 }}
                            >
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();

                                  try {
                                    await removeCartItem(item.id);
                                    onRefresh();
                                    window.dispatchEvent(new CustomEvent('cartUpdated'));
                                  } catch (error) {}
                                }}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>

                            <Link
                              href={merchandiseUrl}
                              onClick={closeCart}
                              className="z-30 flex flex-row space-x-4"
                            >
                              <div className="relative h-16 w-16 cursor-pointer overflow-hidden bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800">
                                {item.product?.images?.[0]?.file?.url ? (
                                  <Image
                                    className="h-full w-full object-cover"
                                    width={64}
                                    height={64}
                                    alt={
                                      item.product.images[0]?.caption ||
                                      item.product.name ||
                                      'Product'
                                    }
                                    src={item.product.images[0].file.url}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                                    <span className="text-xs text-gray-500">No image</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-1 flex-col text-base">
                                {(item.product as any)?.content?.artist && (
                                  <span className="text-sm leading-tight text-neutral-600 dark:text-neutral-400">
                                    {(item.product as any).content.artist}
                                  </span>
                                )}
                                <span className="leading-tight">
                                  {item.product?.name || 'Product'}
                                </span>
                                {options.length > 0 && (
                                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {options.map((option, idx) => (
                                      <span key={idx}>
                                        {option.name}: {option.value}
                                        {idx < options.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex h-16 flex-col justify-between">
                              <Price
                                className="flex justify-end space-y-2 text-right text-sm"
                                amount={String(item.price_total || item.price || 0)}
                                currencyCode={cart.currency || 'USD'}
                              />
                              {item.quantity > 1 && (
                                <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
                                  <span>Qty: {item.quantity}</span>
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();

                                      if (isUpdating) {
                                        return;
                                      }

                                      setIsUpdating(true);

                                      try {
                                        const targetQuantity = item.quantity - 1;

                                        if (targetQuantity === 0) {
                                          const result = await removeCartItem(item.id);
                                        } else {
                                          const result = await updateCartItem(
                                            item.id,
                                            targetQuantity
                                          );
                                        }

                                        await new Promise((resolve) => setTimeout(resolve, 100));

                                        onRefresh();

                                        window.dispatchEvent(new CustomEvent('cartUpdated'));
                                      } catch (error) {
                                      } finally {
                                        setIsUpdating(false);
                                      }
                                    }}
                                    disabled={isUpdating}
                                    className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50 dark:hover:text-neutral-300"
                                    aria-label="Reduce quantity"
                                  >
                                    <svg
                                      className="h-3 w-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="py-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 dark:border-neutral-700">
                      <p>Taxes</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={String(cart.tax_total || 0)}
                        currencyCode={cart.currency || 'USD'}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Shipping</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={String(cart.shipment_total || 0)}
                        currencyCode={cart.currency || 'USD'}
                      />
                    </div>
                    <div className="mb-3 flex items-center justify-between border-b border-neutral-200 pb-1 pt-1 dark:border-neutral-700">
                      <p>Total</p>
                      <Price
                        className="text-right text-base text-black dark:text-white"
                        amount={String(cart.grand_total || 0)}
                        currencyCode={cart.currency || 'USD'}
                      />
                    </div>
                  </div>
                  <a
                    href={cart.checkout_url || '#'}
                    className="block w-full rounded-full bg-blue-600 p-3 text-center text-sm font-medium text-white opacity-90 hover:opacity-100"
                  >
                    Proceed to Checkout
                  </a>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
