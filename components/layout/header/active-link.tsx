'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

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

  let isActive = false;

  if (exact) {
    // For home page and exact matches
    isActive = pathname === href;
  } else {
    // Custom logic for main menu items
    switch (href) {
      case '/shop/new':
        // Shop is active for any /shop/* or /product/* path
        isActive = pathname.startsWith('/shop') || pathname.startsWith('/product');
        break;
      case '/mixtapes':
        // Mixes is active for /mixtapes/ or /mixtape/*
        isActive =
          pathname === '/mixtapes' ||
          pathname.startsWith('/mixtapes/') ||
          pathname.startsWith('/mixtape');
        break;
      case '/info':
        // Info is active for /info or /info/*
        isActive = pathname === '/info' || pathname.startsWith('/info/');
        break;
      default:
        // Default behavior for submenu items
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
