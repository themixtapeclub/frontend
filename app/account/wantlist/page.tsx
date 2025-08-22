// account/wantlist/page.tsx - FIXED VERSION WITH GRID LAYOUT

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { WantlistService } from "lib/commerce/swell/wantlist";

interface WantlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  product_variant_id?: string;
  email: string;
  notify_when_available: boolean;
  date_added: string;
  status: string;
  product?: any;
  variant?: any;
}

export default function WantlistPage() {
  const [wantlistItems, setWantlistItems] = useState<WantlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/account/wantlist');
      return;
    }

    if (user?.id) {
      loadWantlist();
    }
  }, [user?.id, isAuthenticated, authLoading, router]);

  const loadWantlist = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const userEmail = user.email && user.email !== 'null' ? user.email : null;
      const result = await WantlistService.getWantlist(user.id, userEmail);
      if (result.success) {
        const activeItems = result?.items?.filter((item: any) => item.status === 'active');
        setWantlistItems(activeItems as any || []);
      } else {
        setWantlistItems([]);
      }
    } catch {
      setWantlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId: string, variantId?: string) => {
    if (!user?.id) return;

    const itemKey = `${productId}-${variantId || 'no-variant'}`;
    setRemoving(itemKey);

    try {
      const itemExists = wantlistItems.some(
        (item) => item.product_id === productId && item.product_variant_id === variantId
      );

      if (!itemExists) {
        return;
      }

      setWantlistItems((prev) =>
        prev.filter(
          (item) => !(item.product_id === productId && item.product_variant_id === variantId)
        )
      );

      const userEmail = user.email && user.email !== 'null' ? user.email : null;

      if (!userEmail) {
        loadWantlist();
        alert('Unable to remove item: email not available');
        return;
      }

      const result = await WantlistService.removeFromWantlist(
        user.id,
        productId,
        userEmail,
        variantId || null
      );

      if (result.success) {
        setTimeout(async () => {
          await loadWantlist();
        }, 500);
      } else {
        if (
          result.error?.includes('already removed') ||
          result.message?.includes('already removed')
        ) {
          return;
        }
        loadWantlist();
        alert('Failed to remove item from server. Please try again.');
      }
    } catch (error: any) {
      if (error.message?.includes('not found') || error.message?.includes('already removed')) {
        return;
      }
      loadWantlist();
      alert('Network error removing item. Please check your connection and try again.');
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    try {
      const priceInDollars = price > 1000 ? price / 100 : price;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(priceInDollars);
    } catch {
      const asCents = price / 100;
      const asDollars = price;
      if (asCents < 10 && asDollars > 10) {
        return `${asDollars.toFixed(2)}`;
      } else {
        return `${asCents.toFixed(2)}`;
      }
    }
  };

  // ProductCard Component
  const ProductCard = ({ item }: { item: WantlistItem }) => {
    const itemKey = `${item.product_id}-${item.product_variant_id || 'no-variant'}`;
    const isRemoving = removing === itemKey;
    const product = item.product;
    const variant = item.variant;

    const productName = product?.name || `Record ${item.product_id.substring(0, 8)}...`;
    const productSlug = product?.slug;
    const productPrice = product?.price;
    const productCurrency = product?.currency || 'USD';
    const productDescription = product?.description;
    const productImage =
      product?.images?.[0]?.file?.url || product?.images?.[0]?.url || product?.image?.url;

    return (
      <div className="card h-100 shadow-sm">
        {/* Product Image */}
        <div className="position-relative">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="card-img-top"
              style={{
                height: '250px',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              className="card-img-top bg-light d-flex align-items-center justify-content-center"
              style={{ height: '250px' }}
            >
              <div className="text-center">
                <div className="mb-2" style={{ fontSize: '4rem' }}>
                  🎵
                </div>
                <span className="text-muted small">No image</span>
              </div>
            </div>
          )}

          {/* Wantlist badge */}
          <div className="position-absolute end-0 top-0 m-2">
            <span className="badge bg-primary">Want to Buy</span>
          </div>

          {/* Stock Status Overlay */}
          {product?.stock_status && (
            <div className="position-absolute bottom-0 start-0 m-2">
              <span
                className={`badge ${
                  product.stock_status === 'available'
                    ? 'bg-success'
                    : product.stock_status === 'out_of_stock'
                      ? 'bg-danger'
                      : 'bg-warning'
                }`}
              >
                {product.stock_status === 'available'
                  ? 'In Stock'
                  : product.stock_status === 'out_of_stock'
                    ? 'Out of Stock'
                    : product.stock_status}
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column">
          {/* Product Name */}
          <h5 className="card-title mb-2" title={productName}>
            {productName.length > 60 ? `${productName.substring(0, 60)}...` : productName}
          </h5>

          {/* SKU */}
          {product?.sku && (
            <p className="text-muted mb-1">
              <small>SKU: {product.sku}</small>
            </p>
          )}

          {/* Variant Info */}
          {variant && (
            <p className="text-muted mb-2">
              <small>Variant: {variant.name}</small>
            </p>
          )}

          {/* Price */}
          {productPrice && (
            <p className="h6 text-success mb-2">{formatPrice(productPrice, productCurrency)}</p>
          )}

          {/* Date Added */}
          <p className="text-muted mb-2">
            <small>📅 Added {formatDate(item.date_added)}</small>
          </p>

          {/* Email notification */}
          <p className="text-muted mb-3">
            <small>📧 {item.email}</small>
          </p>

          {/* Product Description */}
          {productDescription && (
            <div className="flex-grow-1 mb-3">
              <p
                className="text-muted small"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
                dangerouslySetInnerHTML={{ __html: productDescription }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto">
            <div className="d-grid gap-2">
              {productSlug ? (
                <Link href={`/product/${productSlug}`} className="btn btn-outline-primary btn-sm">
                  View Record
                </Link>
              ) : (
                <button disabled className="btn btn-outline-secondary btn-sm">
                  Product Unavailable
                </button>
              )}

              <button
                onClick={() => removeItem(item.product_id, item.product_variant_id)}
                disabled={isRemoving}
                className="btn btn-outline-danger btn-sm"
              >
                {isRemoving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" />
                    Removing...
                  </>
                ) : (
                  '🗑️ Remove from Wantlist'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="container-fluid p-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '200px' }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-fluid p-4">
        <div className="text-center">
          <h2>Please log in to view your wantlist</h2>
          <Link href="/login" className="btn btn-primary mt-3">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '200px' }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your wantlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-2">My Wantlist</h1>
          <p className="text-muted">Records you want to buy when available</p>
        </div>
      </div>

      {/* Empty State */}
      {wantlistItems.length === 0 && (
        <div className="py-5 text-center">
          <div className="mb-4">
            <span style={{ fontSize: '4rem' }}>🎵</span>
          </div>
          <h3 className="h4 mb-3">Your wantlist is empty</h3>
          <p className="text-muted mb-4">
            When you find records you want to buy, add them to your wantlist and we'll help you
            track them.
          </p>
          <Link href="/" className="btn btn-primary">
            Browse Records
          </Link>
        </div>
      )}

      {/* Wantlist Items Grid */}
      {wantlistItems.length > 0 && (
        <>
          {/* Stats */}
          <div className="row mb-4">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0">
                  {wantlistItems.length} record{wantlistItems.length !== 1 ? 's' : ''} in your
                  wantlist
                </p>
                <button
                  onClick={loadWantlist}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Container */}
          <div className="row g-4">
            {wantlistItems.map((item) => (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <ProductCard item={item} />
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="row mt-5">
            <div className="col">
              <div className="alert alert-light">
                <h6 className="alert-heading">💡 About Your Wantlist</h6>
                <p className="mb-0">
                  Your wantlist helps you track records you want to buy. We'll notify you at{' '}
                  <strong>{user?.email}</strong> when items become available or go on sale.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
