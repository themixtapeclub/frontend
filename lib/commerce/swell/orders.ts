// lib/swell/orders.ts - OrderService using API routes (similar to WantlistService)

export interface OrderItem {
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
  product?: any;
  variant?: any;
}

export interface Order {
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

export interface OrderResponse {
  success: boolean;
  orders: Order[];
  error?: string;
  message?: string;
}

export interface OrderDetailResponse {
  success: boolean;
  order: Order | null;
  error?: string;
  message?: string;
}

export class OrderService {
  private static baseUrl = '/api/orders'; // Using API route pattern like WantlistService

  /**
   * Get all orders for a customer
   */
  static async getOrders(customerId: string): Promise<OrderResponse> {
    try {
      console.log('🔍 OrderService.getOrders called for:', { customerId });

      if (!customerId) {
        return {
          success: false,
          orders: [],
          error: 'Customer ID is required'
        };
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('customerId', customerId);

      // Add cache busting
      params.append('_t', Date.now().toString());

      const url = `${this.baseUrl}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ getOrders failed:', response.status, errorText);
        return {
          success: false,
          orders: [],
          error: `HTTP ${response.status}: ${errorText}`
        };
      }

      const data = await response.json();
      console.log('🔍 Raw API response:', data);
      console.log('🔍 Response type:', typeof data);
      console.log('🔍 Is array?', Array.isArray(data));

      // Handle different response formats
      let ordersArray = [];
      if (Array.isArray(data)) {
        ordersArray = data;
        console.log('🔍 Using direct array, length:', ordersArray.length);
      } else if (data.orders && Array.isArray(data.orders)) {
        ordersArray = data.orders;
        console.log('🔍 Using data.orders, length:', ordersArray.length);
      } else if (data.results && Array.isArray(data.results)) {
        ordersArray = data.results;
        console.log('🔍 Using data.results, length:', ordersArray.length);
      } else {
        console.log('🔍 No recognizable orders array found in response');
        console.log('🔍 Available keys:', Object.keys(data));
      }

      console.log('🔍 Orders array before transformation:', ordersArray);

      // No transformation needed - API already returns correct format
      const orders = ordersArray;

      console.log('✅ getOrders success:', orders.length, 'orders received');
      console.log('🔍 Final orders array:', orders);

      return {
        success: true,
        orders: orders
      };
    } catch (error: any) {
      console.error('❌ getOrders error:', error);
      return {
        success: false,
        orders: [],
        error: error.message || 'Failed to fetch orders'
      };
    }
  }

  /**
   * Get a specific order by ID
   */
  static async getOrder(orderId: string): Promise<OrderDetailResponse> {
    try {
      console.log('🔍 OrderService.getOrder called for:', { orderId });

      if (!orderId) {
        return {
          success: false,
          order: null,
          error: 'Order ID is required'
        };
      }

      const url = `${this.baseUrl}/${orderId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ getOrder failed:', response.status, errorText);
        return {
          success: false,
          order: null,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }

      const data = await response.json();
      console.log('✅ getOrder success:', data);

      return {
        success: true,
        order: data.order || null
      };
    } catch (error: any) {
      console.error('❌ getOrder error:', error);
      return {
        success: false,
        order: null,
        error: error.message || 'Failed to fetch order'
      };
    }
  }

  /**
   * Cancel an order
   */
  static async cancelOrder(
    orderId: string
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('🔍 OrderService.cancelOrder called for:', { orderId });

      if (!orderId) {
        return {
          success: false,
          error: 'Order ID is required'
        };
      }

      const response = await fetch(`${this.baseUrl}/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ cancelOrder failed:', response.status, errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }

      const data = await response.json();
      console.log('✅ cancelOrder success:', data);

      return {
        success: true,
        message: data.message || 'Order cancelled successfully'
      };
    } catch (error: any) {
      console.error('❌ cancelOrder error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel order'
      };
    }
  }

  /**
   * Request order invoice/receipt
   */
  static async getOrderInvoice(
    orderId: string
  ): Promise<{ success: boolean; invoiceUrl?: string; error?: string }> {
    try {
      console.log('🔍 OrderService.getOrderInvoice called for:', { orderId });

      if (!orderId) {
        return {
          success: false,
          error: 'Order ID is required'
        };
      }

      const response = await fetch(`${this.baseUrl}/${orderId}/invoice`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ getOrderInvoice failed:', response.status, errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }

      const data = await response.json();
      console.log('✅ getOrderInvoice success:', data);

      return {
        success: true,
        invoiceUrl: data.invoiceUrl || `/account/orders/${orderId}/invoice`
      };
    } catch (error: any) {
      console.error('❌ getOrderInvoice error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get order invoice'
      };
    }
  }
}
