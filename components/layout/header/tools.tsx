// components/layout/header/tools.tsx

'use client';

import { useAuth } from 'contexts/AuthContext';
import { WantlistService } from 'lib/commerce/swell/wantlist';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import MainMenuButton from './main-menu-button';
import { useMainMenu } from './main-menu-provider';
import { useSearch } from './search-provider';
import SearchToggle from './search-toggle';

interface ToolsProps {
  cartComponent: React.ReactNode;
}

export default function Tools({ cartComponent }: ToolsProps) {
  const { isSearchVisible, toggleSearch, closeSearch } = useSearch();
  const { isOpen: isMainMenuOpen } = useMainMenu();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [shouldUseColAuto, setShouldUseColAuto] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [wantlistCount, setWantlistCount] = useState(0);

  useEffect(() => {
    setMounted(true);
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
    if (!mounted) return;

    if (isSearchVisible) {
      const timer = setTimeout(() => setShouldUseColAuto(true), 150);
      return () => clearTimeout(timer);
    } else {
      setShouldUseColAuto(false);
    }

    return undefined;
  }, [isSearchVisible, mounted]);

  const handleLoginClick = () => {
    closeSearch();
    setShowAccountMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    setShowAccountMenu(false);
    closeSearch();
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
    closeSearch();
  };

  const handleAccountMenuClick = () => {
    setShowAccountMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showAccountMenu && !target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAccountMenu]);

  return (
    <div
      className={`tools mono d-flex align-items-center justify-content-end ${
        shouldUseColAuto ? 'col-auto' : 'col'
      }`}
    >
      <ul className="d-flex justify-content-end list-unstyled m-0 ps-0">
        {!isMainMenuOpen && (
          <li className="d-inline-flex align-items-center">
            {mounted && <SearchToggle isVisible={isSearchVisible} onToggle={toggleSearch} />}
          </li>
        )}

        <li className="d-inline-flex align-items-center ms-2">{cartComponent}</li>

        <li className="d-inline-flex align-items-center account-menu-container position-relative ms-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={toggleAccountMenu}
                className="mx-1 border-0 bg-transparent px-1 outline"
                style={{ cursor: 'pointer' }}
              >
                Account
              </button>

              {showAccountMenu && (
                <div
                  className="position-absolute border bg-white py-2 shadow-sm"
                  style={{
                    top: '100%',
                    right: 0,
                    minWidth: '160px',
                    zIndex: 1000,
                    marginTop: '4px'
                  }}
                >
                  <div className="border-bottom small text-muted px-3 py-1">
                    {user?.first_name || user?.email}
                  </div>

                  <Link
                    href="/account/wantlist"
                    className="d-block text-decoration-none text-dark position-relative px-3 py-2"
                    style={{ fontSize: '14px' }}
                    onClick={handleAccountMenuClick}
                  >
                    <span>Wantlist</span>
                    {wantlistCount > 0 && (
                      <span className="badge bg-secondary ms-2" style={{ fontSize: '10px' }}>
                        {wantlistCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/account"
                    className="d-block text-decoration-none text-dark px-3 py-2"
                    style={{ fontSize: '14px' }}
                    onClick={handleAccountMenuClick}
                  >
                    Account Settings
                  </Link>

                  <Link
                    href="/account/orders"
                    className="d-block text-decoration-none text-dark px-3 py-2"
                    style={{ fontSize: '14px' }}
                    onClick={handleAccountMenuClick}
                  >
                    Order History
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-100 text-dark border-0 bg-transparent px-3 py-2 text-start"
                    style={{ fontSize: '14px', cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/account/login" className="mx-1 px-1 outline" onClick={handleLoginClick}>
              Login
            </Link>
          )}
        </li>

        <li className="d-inline-flex align-items-center ms-3">
          <MainMenuButton />
        </li>
      </ul>
    </div>
  );
}
