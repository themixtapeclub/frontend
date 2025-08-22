// components/cart/delete-item-button.tsx
import { XMarkIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import LoadingDots from 'components/ui/loading-dots';
import { removeCartItem } from "lib/commerce/swell/client";
import { useTransition } from 'react';

// Update the type to match the new cart item structure
interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  price_total?: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    images?: Array<{ file: { url: string }; caption?: string }>;
  };
  options?: Array<{ name: string; value: string }>;
}

export default function DeleteItemButton({
  item,
  onRefresh
}: {
  item: CartItem;
  onRefresh: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      aria-label="Remove cart item"
      onClick={() => {
        startTransition(async () => {
          try {
            await removeCartItem(item.id);
            console.log('✅ Item removed from cart');

            // Refresh the cart data
            onRefresh();

            // Dispatch cart updated event
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          } catch (error) {
            console.error('❌ Error removing item:', error);
            // You could show a toast notification here
          }
        });
      }}
      disabled={isPending}
      className={clsx(
        'ease flex h-[17px] w-[17px] items-center justify-center rounded-full bg-neutral-500 transition-all duration-200',
        {
          'cursor-not-allowed px-0': isPending
        }
      )}
    >
      {isPending ? (
        <LoadingDots className="bg-white" />
      ) : (
        <XMarkIcon className="hover:text-accent-3 mx-[1px] h-4 w-4 text-white dark:text-black" />
      )}
    </button>
  );
}
