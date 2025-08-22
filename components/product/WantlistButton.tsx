// components/product/WantlistButton.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { WantlistService } from "lib/commerce/swell/wantlist";

interface WantlistButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
  };
  variant?: {
    id: string;
    name: string;
  } | null;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function WantlistButton({
  product,
  variant = null,
  className = '',
  showText = true,
  size = 'md'
}: WantlistButtonProps) {
  const [isInWantlist, setIsInWantlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, isAuthenticated, loading: authContextLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authContextLoading) {
      setAuthLoading(false);
    }
  }, [authContextLoading]);

  useEffect(() => {
    if (!authLoading) {
      checkWantlistStatus();
    }
    return; // Fix: Add return statement
  }, [product.id, variant?.id, user?.id, isAuthenticated, authLoading]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
    return; // Fix: Add return statement for empty case
  }, [error, success]);

  const getCustomerId = () => {
    if (isAuthenticated && user?.id) {
      return user.id;
    } else if (guestEmail) {
      return `guest_${btoa(guestEmail).replace(/[^a-zA-Z0-9]/g, '')}`;
    }
    return null;
  };

  const getEmail = () => {
    if (isAuthenticated && user?.email) {
      return user.email;
    } else if (guestEmail) {
      return guestEmail;
    }
    return null;
  };

  const checkWantlistStatus = async () => {
    const customerId = getCustomerId();
    const email = getEmail();

    if (!customerId || !email) {
      setIsInWantlist(false);
      return;
    }

    try {
      console.log('🔍 Checking wantlist status for:', {
        customerId,
        productId: product.id,
        email,
        variantId: variant?.id
      });

      const result = await WantlistService.isInWantlist(
        customerId,
        product.id,
        email,
        variant?.id || undefined // Fix: Change null to undefined
      );

      const inWantlist = result.success ? result.isInWantlist : false;
      setIsInWantlist(inWantlist);
      console.log('🔍 Wantlist status result:', result);
    } catch (error) {
      console.error('❌ Error checking wantlist status:', error);
      setIsInWantlist(false);
    }
  };

  const handleWantlistToggle = async () => {
    console.log('🔍 Wantlist toggle clicked:', { authLoading, isAuthenticated, guestEmail });

    setError(null);
    setSuccess(null);

    if (authLoading) {
      console.log('⏳ Auth still loading, skipping...');
      return;
    }

    if (!isAuthenticated && isInWantlist) {
      setError('Please sign in to manage your wantlist');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    if (!isAuthenticated && (!guestEmail || !guestEmail.includes('@'))) {
      setError('Please enter a valid email address');
      return;
    }

    const customerId = getCustomerId();
    const email = getEmail();

    if (!customerId || !email) {
      console.error('❌ No customer ID or email available');
      setError('Unable to identify customer');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isInWantlist) {
        if (!isAuthenticated) {
          setError('Please sign in to remove items from your wantlist');
          setLoading(false);
          return;
        }

        console.log('🔄 Removing from wantlist...');
        result = await WantlistService.removeFromWantlist(
          customerId,
          product.id,
          email,
          variant?.id || undefined // Fix: Change null to undefined
        );
        if (result.success) {
          setIsInWantlist(false);
          setSuccess('Removed from wantlist');
          console.log('✅ Removed from wantlist');
        }
      } else {
        console.log('🔄 Adding to wantlist...');
        result = await WantlistService.addToWantlist(
          customerId,
          product.id,
          email,
          variant?.id || undefined // Fix: Change null to undefined
        );
        if (result.success) {
          setIsInWantlist(true);
          setSuccess("Added to wantlist! We'll notify you when it's available.");
          if (!isAuthenticated) {
            setGuestEmail('');
          }
          console.log('✅ Added to wantlist');
        }
      }

      if (!result.success) {
        console.error('❌ Wantlist operation failed:', result.error || result.message);

        if (
          result.message?.includes('already in wantlist') ||
          result.error?.includes('already in wantlist')
        ) {
          setIsInWantlist(true);
          setSuccess('Item is already in your wantlist');
          console.log('ℹ️ Item was already in wantlist, updated UI state');
          return;
        }

        const errorMessage =
          result.message || result.error || 'Operation failed. Please try again.';
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Wantlist error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (!authLoading && !isAuthenticated && !isInWantlist) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="Enter email for notifications"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleWantlistToggle}
            disabled={loading || !guestEmail}
            className={`
              inline-flex items-center justify-center gap-2 rounded-md border transition-all duration-200
              ${sizeClasses[size]}
              border-blue-600 bg-blue-600 text-white hover:bg-blue-700
              ${loading || !guestEmail ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              ${className}
            `}
          >
            {loading ? (
              <>
                <div
                  className={`${iconSizes[size]} animate-spin rounded-full border-b-2 border-current`}
                />
                {showText && <span>Adding...</span>}
              </>
            ) : (
              <>
                <span className={iconSizes[size]}>🤍</span>
                {showText && <span>Add to Wantlist</span>}
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
            {success}
          </div>
        )}
      </div>
    );
  }

  if (!authLoading && !isAuthenticated && isInWantlist) {
    return (
      <div className="space-y-2">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className={iconSizes[size]}>❤️</span>
            {showText && <span className="text-sm font-medium">In Your Wantlist</span>}
          </div>
          <button
            onClick={() => router.push('/account/login')}
            className="text-xs text-blue-600 underline hover:text-blue-800"
          >
            Sign in to manage your wantlist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleWantlistToggle}
        disabled={loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-md border transition-all duration-200
          ${sizeClasses[size]}
          ${
            isInWantlist
              ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }
          ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${className}
        `}
        title={
          authLoading
            ? 'Loading...'
            : !isAuthenticated
              ? 'Add to wantlist for notifications'
              : isInWantlist
                ? `Remove ${product.name}${variant ? ` (${variant.name})` : ''} from wantlist`
                : `Add ${product.name}${variant ? ` (${variant.name})` : ''} to wantlist`
        }
      >
        {loading || authLoading ? (
          <>
            <div
              className={`${iconSizes[size]} animate-spin rounded-full border-b-2 border-current`}
            />
            {showText && <span>Loading...</span>}
          </>
        ) : (
          <>
            <span className={iconSizes[size]}>{isInWantlist ? '❤️' : '🤍'}</span>
            {showText && (
              <span>
                {authLoading
                  ? 'Loading...'
                  : isInWantlist
                    ? 'Remove from Wantlist'
                    : 'Add to Wantlist'}
              </span>
            )}
          </>
        )}
      </button>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
          {success}
        </div>
      )}
    </div>
  );
}

export function WantlistIconButton({
  product,
  variant = null,
  className = '',
  size = 'md'
}: Omit<WantlistButtonProps, 'showText'>) {
  return (
    <WantlistButton
      product={product}
      variant={variant}
      className={className}
      showText={false}
      size={size}
    />
  );
}

export function useWantlistStatus(productId: string, variantId?: string | null) {
  const [isInWantlist, setIsInWantlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id && user?.email) {
      checkStatus();
    } else {
      setIsInWantlist(false);
    }
    return; // Fix: Add return statement
  }, [productId, variantId, user?.id, user?.email, isAuthenticated]);

  const checkStatus = async () => {
    if (!user?.id || !user?.email) return;

    setLoading(true);
    try {
      const result = await WantlistService.isInWantlist(
        user.id,
        productId,
        user.email,
        variantId || undefined // Fix: Change null to undefined
      );
      const inWantlist = result.success ? result.isInWantlist : false;
      setIsInWantlist(inWantlist);
    } catch (error) {
      console.error('❌ Error checking wantlist status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { isInWantlist, loading, checkStatus };
}
