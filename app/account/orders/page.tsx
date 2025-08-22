// account/orders/page.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { OrderService } from "lib/commerce/swell/orders";

interface OrderItem {
  id: string;
  product_id: string;
  product_variant_id?: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: number;
  currency: string;
  product_image?: string;
  product_slug?: string;
  sku?: string;
}

interface Order {
  id: string;
  number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  date_created: string;
  date_updated?: string;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  currency: string;
  items: OrderItem[];
  shipping?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  billing?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/account/orders');
      return;
    }

    if (user?.id) {
      loadOrders();
    }
  }, [user?.id, isAuthenticated, authLoading, router]);

  const loadOrders = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      console.log('🔍 Loading orders for user:', user.id);

      // Use OrderService similar to WantlistService pattern
      const result = await OrderService.getOrders(user.id);

      console.log('🔍 OrderService.getOrders result:', result);

      if (result.success) {
        console.log('🔍 Orders received:', result.orders.length);
        console.log('🔍 Raw orders:', result.orders);

        // Sort orders by date (newest first)
        const sortedOrders = result.orders.sort(
          (a: Order, b: Order) =>
            new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
        );

        console.log('🔍 Sorted orders:', sortedOrders);
        setOrders(sortedOrders);
      } else {
        console.error('❌ Failed to load orders:', result.error);
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
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
      // Price is already in dollars, no conversion needed
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(price);
    } catch {
      return `${price.toFixed(2)}`;
    }
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' | 'fulfillment') => {
    const getVariant = () => {
      switch (status.toLowerCase()) {
        case 'complete':
        case 'paid':
        case 'fulfilled':
          return 'bg-success';
        case 'processing':
        case 'pending':
          return 'bg-warning';
        case 'cancelled':
        case 'failed':
        case 'refunded':
          return 'bg-danger';
        case 'partial':
          return 'bg-info';
        default:
          return 'bg-secondary';
      }
    };

    const formatStatus = (status: string) => {
      return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    };

    return <span className={`badge ${getVariant()}`}>{formatStatus(status)}</span>;
  };

  // Order Card Component
  const OrderCard = ({ order }: { order: Order }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="card mb-4 shadow-sm">
        {/* Order Header */}
        <div className="card-header bg-light">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h5 className="mb-1">Order #{order.number}</h5>
              <small className="text-muted">Placed {formatDate(order.date_created)}</small>
            </div>
            <div className="col-md-6 text-md-end">
              {/* <div className="mb-2">
                {getStatusBadge(order.status, 'order')}{' '}
                {getStatusBadge(order.payment_status, 'payment')}{' '}
                {getStatusBadge(order.fulfillment_status, 'fulfillment')}
              </div> */}
              <h5 className="text-success mb-0">
                {formatPrice(order.grand_total, order.currency)}
              </h5>
            </div>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="card-body">
          <div className="row g-3">
            {order.items.slice(0, expanded ? order.items.length : 2).map((item) => (
              <div key={item.id} className="col-12">
                <div className="d-flex align-items-center">
                  {/* Product Image */}
                  <div className="me-3 flex-shrink-0">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className=""
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <img
                        src="/placeholder.jpg"
                        alt="Product placeholder"
                        className=""
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow-1">
                    <h6 className="mb-1">
                      {item.product_slug ? (
                        <Link
                          href={`/product/${item.product_slug}`}
                          className="text-decoration-none"
                        >
                          {item.product_name}
                        </Link>
                      ) : (
                        item.product_name
                      )}
                    </h6>
                    {item.variant_name && (
                      <p className="text-muted small mb-1">Variant: {item.variant_name}</p>
                    )}
                    {item.sku && <p className="text-muted small mb-1">SKU: {item.sku}</p>}
                    <p className="text-muted small mb-0">
                      Qty: {item.quantity} × {formatPrice(item.price, item.currency)}
                    </p>
                  </div>

                  {/* Item Total */}
                  <div className="text-end">
                    <strong>{formatPrice(item.price * item.quantity, item.currency)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {order.items.length > 2 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn btn-outline-secondary btn-sm"
              >
                {expanded
                  ? `Show Less`
                  : `Show ${order.items.length - 2} More Item${
                      order.items.length - 2 > 1 ? 's' : ''
                    }`}
              </button>
            </div>
          )}

          {/* Order Summary (when expanded) */}
          {expanded && (
            <div className="border-top mt-4 pt-3">
              <div className="row">
                <div className="col-md-6">
                  {/* Shipping Address */}
                  {order.shipping && (
                    <div className="mb-3">
                      <h6 className="text-muted">Shipping Address</h6>
                      <address className="small">
                        {order.shipping.name}
                        <br />
                        {order.shipping.address1}
                        <br />
                        {order.shipping.address2 && (
                          <>
                            {order.shipping.address2}
                            <br />
                          </>
                        )}
                        {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
                        <br />
                        {order.shipping.country}
                      </address>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {/* Order Totals */}
                  <div className="table-responsive">
                    <table className="table-sm table">
                      <tbody>
                        <tr>
                          <td>Subtotal:</td>
                          <td className="text-end">
                            {formatPrice(order.subtotal, order.currency)}
                          </td>
                        </tr>
                        <tr>
                          <td>Shipping:</td>
                          <td className="text-end">
                            {formatPrice(order.shipping_total, order.currency)}
                          </td>
                        </tr>
                        <tr>
                          <td>Tax:</td>
                          <td className="text-end">
                            {formatPrice(order.tax_total, order.currency)}
                          </td>
                        </tr>
                        <tr className="table-active">
                          <td>
                            <strong>Total:</strong>
                          </td>
                          <td className="text-end">
                            <strong>{formatPrice(order.grand_total, order.currency)}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Actions */}
          <div className="border-top mt-3 pt-3">
            <div className="d-flex flex-wrap gap-2">
              <Link href={`/account/orders/${order.id}`} className="btn btn-outline-primary btn-sm">
                View Details
              </Link>
              {order.status === 'complete' && order.fulfillment_status === 'fulfilled' && (
                <button className="btn btn-outline-secondary btn-sm">Reorder</button>
              )}
              {(order.status === 'processing' || order.status === 'pending') && (
                <button className="btn btn-outline-danger btn-sm">Cancel Order</button>
              )}
              <button className="btn btn-outline-secondary btn-sm">Download Invoice</button>
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
          <h2>Please log in to view your orders</h2>
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
            <p className="text-muted">Loading your orders...</p>
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
          <h1 className="h2 mb-2">Order History</h1>
        </div>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="py-5 text-center">
          <div className="mb-4">
            <span style={{ fontSize: '4rem' }}>📦</span>
          </div>
          <h3 className="h4 mb-3">No orders yet</h3>
          <p className="text-muted mb-4">
            When you place your first order, it will appear here for tracking and reference.
          </p>
          <Link href="/" className="btn btn-primary">
            Browse Records
          </Link>
        </div>
      )}

      {/* Orders List */}
      {orders.length > 0 && (
        <>
          {/* Stats */}
          <div className="row mb-4">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0">
                  {orders.length} order{orders.length !== 1 ? 's' : ''} found
                </p>
                {/* <button
                  onClick={loadOrders}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button> */}
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="row">
            <div className="col">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="row mt-4">
            <div className="col">
              <div className="alert alert-light">
                <h6 className="alert-heading">💡 Need Help?</h6>
                <p className="mb-0">
                  Questions about an order? Contact our support team or check the{' '}
                  <Link href="/help/orders">order help center</Link> for common questions.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
