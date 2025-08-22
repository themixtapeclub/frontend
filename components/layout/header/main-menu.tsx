// components/layout/header/main-menu.tsx

'use client';

import { useAuth } from 'contexts/AuthContext';
import { WantlistService } from 'lib/commerce/swell/wantlist';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useMainMenu } from './main-menu-provider';
import Search from './main-menu-search';

export default function FullMenu() {
  const { isOpen, closeMenu } = useMainMenu();
  const [contentHeight, setContentHeight] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, loading, logout } = useAuth();
  const [wantlistCount, setWantlistCount] = useState(0);

  useEffect(() => {
    if (menuRef.current) {
      const fullHeight = menuRef.current.scrollHeight;
      setContentHeight(fullHeight);
    }
  }, []);

  useEffect(() => {
    const fetchWantlistCount = async () => {
      if (isAuthenticated && user?.id) {
        const result = await WantlistService.getWantlistCount(user.id);
        if (result.success) {
          setWantlistCount(result.count);
        } else {
          setWantlistCount(0);
        }
      } else {
        setWantlistCount(0);
      }
    };

    fetchWantlistCount();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMenu]);

  useEffect(() => {
    const handleLinkClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      const button = target.closest('button');

      if ((link || button) && isOpen && menuRef.current?.contains(target)) {
        closeMenu();

        const scrollToTop = () => {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          window.scrollTo(0, 0);
        };

        scrollToTop();

        setTimeout(scrollToTop, 150);
        setTimeout(scrollToTop, 300);
      }
    };

    if (menuRef.current) {
      menuRef.current.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (menuRef.current) {
        menuRef.current.removeEventListener('click', handleLinkClick);
      }
    };
  }, [isOpen, closeMenu]);

  const handleLogout = async () => {
    await logout();
    closeMenu();
  };

  return (
    <div
      ref={menuRef}
      id="menu-full"
      className="container-fluid justify-content-center genre format relative z-40 m-0 bg-white p-0 text-center dark:bg-black"
      style={{
        top: '3.3rem',
        overflow: 'hidden',
        maxHeight: isOpen ? `${Math.max(contentHeight, 1200)}px` : '0px',
        opacity: isOpen ? 1 : 0,
        transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
        visibility: isOpen ? 'visible' : 'hidden'
      }}
    >
      <div className="w-full">
        <Search onSearchSubmit={closeMenu} />
      </div>

      <ul className="row justify-content-center mono fs-6 m-0 p-0">
        <li className="menu-item col-12 d-block fs-4 mb-5 text-nowrap p-0 text-center">
          <Link href="/shop/new/" className="d-block mono m-0 p-0 outline" aria-current="page">
            Shop
          </Link>
          <ul className="sub-menu row justify-content-center w-100 m-0 p-0">
            <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/new/" className="d-block m-0 p-0" aria-current="page">
                New
              </Link>
            </li>
            {/* <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/featured/" className="d-block m-0 p-0">
                Featured
              </Link>
            </li>
            <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/format/merchandise/" className="d-block m-0 p-0">
                Merchandise
              </Link>
            </li> */}
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/house/" className="d-block m-0 p-0">
                House
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/jazz/" className="d-block m-0 p-0">
                Jazz
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/ambient/" className="d-block m-0 p-0">
                Ambient
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/disco/" className="d-block m-0 p-0">
                Disco
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/electronic/" className="d-block m-0 p-0">
                Electronic
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/brazil/" className="d-block m-0 p-0">
                Brazil
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/africa/" className="d-block m-0 p-0">
                Africa
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/techno/" className="d-block m-0 p-0">
                Techno
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/asia/" className="d-block m-0 p-0">
                Asia
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/world/" className="d-block m-0 p-0">
                World
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/downtempo/" className="d-block m-0 p-0">
                Downtempo
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/gospel/" className="d-block m-0 p-0">
                Gospel
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/library/" className="d-block m-0 p-0">
                Library
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/hip-hop/" className="d-block m-0 p-0">
                Hip-Hop
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/rock/" className="d-block m-0 p-0">
                Rock
              </Link>
            </li>
            <li className="menu-item col d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/shop/genre/experimental/" className="d-block m-0 p-0">
                Experimental
              </Link>
            </li>

            {loading ? (
              <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
                <span className="text-muted d-block m-0 p-0">Loading...</span>
              </li>
            ) : isAuthenticated ? (
              <>
                <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
                  <Link href="/account" className="d-block m-0 p-0 outline">
                    Account
                  </Link>
                </li>

                <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
                  <Link href="/account/wantlist" className="d-block position-relative m-0 p-0">
                    <span>Wantlist</span>
                    {wantlistCount > 0 && (
                      <span className="badge bg-secondary ms-2" style={{ fontSize: '12px' }}>
                        {wantlistCount}
                      </span>
                    )}
                  </Link>
                </li>

                <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
                  <Link href="/account" className="d-block m-0 p-0">
                    Settings
                  </Link>
                </li>

                <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
                  <Link href="/account/orders" className="d-block m-0 p-0">
                    Orders
                  </Link>
                </li>
              </>
            ) : (
              <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
                <Link href="/account/login" className="d-block m-0 p-0 outline">
                  Login
                </Link>
              </li>
            )}

            <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/bag/" className="d-block m-0 p-0">
                Cart
              </Link>
            </li>
          </ul>
        </li>
        <li className="menu-item col-12 d-block fs-4 mb-5 text-nowrap p-0 text-center">
          <Link href="/listen/" className="d-block mono m-0 p-0 outline">
            Mixes
          </Link>
          <ul className="sub-menu row justify-content-center w-100 m-0 p-0">
            <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/listen/" className="d-block m-0 p-0">
                Recent
              </Link>
            </li>
            <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/featured/" className="d-block m-0 p-0">
                Featured
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/mixtapes/groovy/" className="d-block m-0 p-0">
                Groovy
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/mixtapes/chill/" className="d-block m-0 p-0">
                Chill
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/mixtapes/global/" className="d-block m-0 p-0">
                Global
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/mixtapes/healing/" className="d-block m-0 p-0">
                Healing
              </Link>
            </li>
            <li className="menu-item col-6 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/mixtapes/dance/" className="d-block m-0 p-0">
                Dance
              </Link>
            </li>
            <li className="menu-item col d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/mixtapes/nostalgia/" className="d-block m-0 p-0">
                Nostalgia
              </Link>
            </li>
          </ul>
        </li>
        <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
          <Link href="/info/" className="d-block mono m-0 p-0 outline">
            Info
          </Link>
          <ul className="sub-menu row justify-content-center w-100 m-0 p-0">
            <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <Link href="/info/" className="d-block m-0 p-0">
                About
              </Link>
            </li>
            <li className="menu-item col-12 d-block fs-4 text-nowrap p-0 text-center">
              <a
                target="_blank"
                href="https://instagram.com/themixtapeclub"
                className="d-block m-0 p-0"
              >
                Instagram
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

export function SearchMenu() {
  const [isVisible, setIsVisible] = useState(false);

  const closeSearch = () => {
    setIsVisible(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center col"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div className="w-100">
        <Search onSearchSubmit={closeSearch} />
      </div>
    </div>
  );
}
