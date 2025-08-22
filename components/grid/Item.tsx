// components/grid/Item.tsx

import { ReactNode } from 'react';

interface GridItemProps {
  children: ReactNode;
  type: 'product' | 'mixtape';
  id: string;
  inStock?: boolean;
  stock?: number;
  category?: string;
  featured?: boolean;
  className?: string;
  baseClassName?: string; // Add this line
}

export function GridItem({
  children,
  type,
  id,
  inStock,
  category,
  featured,
  className = '',
  baseClassName // Add this parameter
}: GridItemProps) {
  const baseClasses = baseClassName || 'col-6 col-sm-4 col-lg-3 pb-5 m-0 p-0'; // Change this line
  const typeClass = type;
  const stockClass = type === 'product' ? (inStock ? 'instock' : 'outofstock') : '';
  const categoryClass = category ? `category-${category}` : '';
  const featuredClass = featured ? 'featured' : '';

  const allClasses = [baseClasses, typeClass, stockClass, categoryClass, featuredClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={allClasses} data-id={id} data-type={type}>
      {children}
    </div>
  );
}
