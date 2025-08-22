// components/layout/header/active-cart.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface ActiveCartProps {
  children: ReactNode;
  className?: string;
}

export default function ActiveCart({ children, className = '' }: ActiveCartProps) {
  const pathname = usePathname();

  // Check if we're on a cart or checkout related page
  const isCartActive = pathname.includes('/cart') || pathname.includes('/checkout');

  const finalClassName = isCartActive ? `${className} yellow`.trim() : className;

  return <div className={finalClassName}>{children}</div>;
}
