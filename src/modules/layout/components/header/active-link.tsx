'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface ActiveLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  onClick?: () => void;
}

export default function ActiveLink({
  href,
  children,
  className = '',
  activeClassName = 'yellow',
  exact = false,
  onClick
}: ActiveLinkProps) {
  const pathname = usePathname();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Only calculate active state after mounting to avoid hydration mismatch
  let isActive = false;
  
  if (hasMounted) {
    if (exact) {
      isActive = pathname === href;
    } else if (href === '/') {
      isActive = pathname === '/';
    } else if (href === '/shop/new' || href === '/shop' || href.startsWith('/shop')) {
      isActive = pathname.startsWith('/shop') || pathname.startsWith('/product');
    } else if (href === '/mixtapes' || href === '/mixes' || href.startsWith('/mixtape') || href.startsWith('/mix')) {
      isActive = pathname === '/mixtapes' ||
                 pathname === '/mixes' ||
                 pathname.startsWith('/mixtapes/') ||
                 pathname.startsWith('/mixes/') ||
                 pathname.startsWith('/mixtape');
    } else if (href === '/info' || href.startsWith('/info')) {
      isActive = pathname === '/info' || pathname.startsWith('/info/');
    } else {
      const cleanHref = href.replace(/\/$/, '');
      const cleanPathname = pathname.replace(/\/$/, '');
      isActive = cleanPathname === cleanHref || cleanPathname.startsWith(cleanHref + '/');
    }
  }

  const finalClassName = isActive ? `${className} ${activeClassName}`.trim() : className;

  return (
    <Link href={href} className={finalClassName} onClick={onClick}>
      {children}
    </Link>
  );
}