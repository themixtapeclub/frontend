// components/cart/add-to-cart.tsx

import { PlusIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import LoadingDots from 'components/ui/loading-dots';
import { SwellProduct, addToCart, getCartQuantityForProduct } from 'lib/commerce/swell/client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

export function AddToCart({
  availableForSale,
  product,
  currentPrice,
  hasSelectedVariant = true,
  variant = 'full',
  className = '',
  hideIfInCart = false,
  hideIfOutOfStock = false
}: {
  product: SwellProduct | any; // Allow more flexible product type
  availableForSale: boolean;
  currentPrice?: number | null;
  hasSelectedVariant?: boolean;
  variant?: 'full' | 'compact';
  className?: string;
  hideIfInCart?: boolean;
  hideIfOutOfStock?: boolean;
}) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedOptions, setSelectedOptions] = useState<Array<{ name: string; value: string }>>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isLoadingCartQuantity, setIsLoadingCartQuantity] = useState(true);

  const isGiftCard =
    product?.slug === 'gift-card' ||
    product?.name?.toLowerCase().includes('gift card') ||
    (product as any)?.type === 'giftcard' ||
    (product as any)?.delivery === 'giftcard';

  // Use availableForSale which is correctly passed from ProductCard
  const hasRealStock = availableForSale === true;

  const stockQuantity = isGiftCard ? 999 : hasRealStock ? 999 : 0; // If availableForSale says it's available, assume unlimited for simplicity

  const hasPerCustomerLimit = (product as any)?.content?.per_customer === true;

  const canAddQuantity = hasPerCustomerLimit
    ? Math.max(0, 1 - cartQuantity)
    : Math.max(0, stockQuantity - cartQuantity);

  const isAtLimit = canAddQuantity === 0;
  const isInCart = cartQuantity > 0;
  // Use the same logic as ProductCard price/play button display
  const hasStock = hasRealStock;

  useEffect(() => {
    const currentVariantArray: Array<{ name: string; value: string }> = [];
    searchParams.forEach((value, key) => {
      currentVariantArray.push({ value, name: key });
    });
    setSelectedOptions(currentVariantArray);
  }, [searchParams]);

  useEffect(() => {
    const loadCartQuantity = async () => {
      setIsLoadingCartQuantity(true);
      try {
        if (typeof getCartQuantityForProduct === 'function') {
          const currentQuantity = await getCartQuantityForProduct(product.id, selectedOptions);
          setCartQuantity(currentQuantity || 0);
        } else {
          setCartQuantity(0);
        }
      } catch {
        setCartQuantity(0);
      } finally {
        setIsLoadingCartQuantity(false);
      }
    };
    loadCartQuantity();
  }, [product.id, selectedOptions]);

  useEffect(() => {
    const handleCartUpdate = async () => {
      try {
        if (typeof getCartQuantityForProduct === 'function') {
          const currentQuantity = await getCartQuantityForProduct(product.id, selectedOptions);
          setCartQuantity(currentQuantity || 0);
        }
      } catch {}
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [product.id, selectedOptions]);

  const displayPrice =
    isGiftCard && currentPrice !== undefined && currentPrice !== null
      ? currentPrice
      : product.price;

  const buttonDisabled = isPending || !hasStock || isInCart || (isGiftCard && !hasSelectedVariant);

  // Hide component if conditions are met
  if (isLoadingCartQuantity) return null; // Don't show button until cart quantity is determined
  // if (hideIfInCart && isInCart) return null;
  // if (hideIfOutOfStock && (!hasStock || !availableForSale)) return null;

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (buttonDisabled) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await addToCart({
          productId: product.id,
          quantity: 1,
          options: selectedOptions
        });
        if (result) {
          setCartQuantity((prev) => prev + 1);
          window.dispatchEvent(
            new CustomEvent('cartUpdated', {
              detail: {
                product,
                quantity: 1,
                cartData: result
              }
            })
          );
        } else {
          throw new Error('Failed to add item to cart');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to add item to cart');
      }
    });
  };

  const getButtonTitle = () => {
    if (!availableForSale) return 'Out Of Stock';
    if (!hasStock) return 'Out Of Stock';
    if (isInCart) return 'Already in cart';
    if (hasPerCustomerLimit && cartQuantity >= 1) return 'Maximum 1 per customer';
    if (!hasPerCustomerLimit && isAtLimit) return 'Maximum quantity in cart';
    if (isGiftCard && !hasSelectedVariant) return 'Please select a gift card value';
    return 'Add To Cart';
  };

  const getButtonText = () => {
    if (isPending) return variant === 'compact' ? 'Adding...' : 'Adding...';
    if (!hasStock) return variant === 'compact' ? 'Out Of Stock' : 'Out Of Stock';
    if (isInCart && variant === 'compact') return 'In Cart';
    if (isInCart && variant === 'full') return 'In Cart';
    if (hasPerCustomerLimit && cartQuantity >= 1)
      return variant === 'compact' ? '1 Per Customer' : '1 Per Customer';
    if (isGiftCard && !hasSelectedVariant)
      return variant === 'compact' ? 'Select Value' : 'Select Gift Card Value';
    if (isGiftCard && hasSelectedVariant)
      return variant === 'compact' ? `Add ${displayPrice}` : `Add ${displayPrice} Gift Card`;
    // Default: always show "Add to Cart" for available items (like product page)
    return variant === 'compact' ? 'Add to Cart' : 'Add To Cart';
  };

  const baseClasses =
    variant === 'compact'
      ? 'relative flex w-full items-center justify-center bg-blue-600 p-2 tracking-wide text-white transition-colors duration-200'
      : 'relative flex w-full items-center justify-center bg-blue-600 p-2 tracking-wide text-white transition-colors duration-200';

  const buttonClasses = clsx(
    baseClasses,
    {
      'cursor-not-allowed opacity-60 hover:opacity-60': buttonDisabled && !isInCart,
      'cursor-default opacity-60': isInCart,
      'cursor-not-allowed opacity-75': isPending,
      'hover:bg-blue-700': !buttonDisabled && !isPending
    },
    className
  );

  const buttonStyle =
    variant === 'compact'
      ? {
          fontSize: '14px',
          padding: '8px 16px'
        }
      : undefined;

  return (
    <div className={variant === 'compact' ? '' : 'space-y-2'}>
      {error && variant === 'full' && (
        <div className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>
      )}

      <button
        aria-label="Add item to cart"
        disabled={buttonDisabled}
        title={getButtonTitle()}
        onClick={handleAddToCart}
        className={buttonClasses}
        style={buttonStyle}
      >
        <div className="absolute left-0 ml-4">
          {!isPending ? (
            !isAtLimit && !isGiftCard && !isInCart ? (
              <PlusIcon className="h-5" />
            ) : null
          ) : (
            <LoadingDots className="mb-3 bg-white" />
          )}
        </div>
        <span>{getButtonText()}</span>
      </button>

      {error && variant === 'compact' && <div className="mt-1 text-sm text-red-600">{error}</div>}
    </div>
  );
}
