// app/api/wantlist-backend/route.js - Proper Swell Backend API implementation
import { NextResponse } from 'next/server';

class SwellBackendAPI {
  constructor() {
    this.baseURL = 'https://api.swell.store';
    this.storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    this.secretKey = process.env.SWELL_SECRET_KEY;

    console.log('🔍 SwellBackendAPI initialization:');
    console.log('  Store ID:', this.storeId ? `${this.storeId.substring(0, 8)}...` : 'MISSING');
    console.log(
      '  Secret Key:',
      this.secretKey ? `${this.secretKey.substring(0, 8)}...` : 'MISSING'
    );

    if (!this.storeId) {
      throw new Error('Missing NEXT_PUBLIC_SWELL_STORE_ID environment variable');
    }

    if (!this.secretKey) {
      throw new Error('Missing SWELL_SECRET_KEY environment variable');
    }
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;

    // Use Basic Authentication as shown in Swell docs: curl -u store-id:secret-key
    const auth = Buffer.from(`${this.storeId}:${this.secretKey}`).toString('base64');

    const options = {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    console.log(`🔍 Backend API Request: ${method} ${url}`);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Backend API ${method} ${endpoint} failed:`, response.status, errorText);
      throw new Error(`Backend API request failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Backend API ${method} ${endpoint} success`);
    return result;
  }

  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  async patch(endpoint, data) {
    return this.request('PATCH', endpoint, data);
  }

  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

const swellAPI = new SwellBackendAPI();

// GET /api/wantlist-backend - Get customer's wantlist from account content
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    console.log('🔍 Getting customer account via Backend API:', customerId);

    // Get customer account using proper Backend API
    const customer = await swellAPI.get(`/accounts/${customerId}`);
    console.log('🔍 Customer found via Backend API');

    // Extract wantlist from customer content
    const wantlistData = customer.content?.wantlist || [];
    console.log('🔍 Wantlist data:', wantlistData.length, 'items');

    // Filter active items
    const activeItems = wantlistData.filter((item) => item.status === 'active');

    // Optionally fetch product details for each item
    const itemsWithProducts = await Promise.all(
      activeItems.map(async (item) => {
        try {
          const product = await swellAPI.get(`/products/${item.product_id}`);
          let variant = null;

          if (item.product_variant_id && product.variants?.results) {
            variant = product.variants.results.find((v) => v.id === item.product_variant_id);
          }

          return {
            id: item.id || `${item.product_id}-${item.product_variant_id || 'no-variant'}`,
            ...item,
            product,
            variant
          };
        } catch (error) {
          console.error('Error fetching product for wantlist item:', error);
          return {
            id: item.id || `${item.product_id}-${item.product_variant_id || 'no-variant'}`,
            ...item,
            product: null,
            variant: null
          };
        }
      })
    );

    return NextResponse.json({ success: true, items: itemsWithProducts });
  } catch (error) {
    console.error('GET /api/wantlist-backend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/wantlist-backend - Add item to wantlist via Backend API
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, productId, email, variantId } = body;

    console.log('🔍 POST /api/wantlist-backend received:', {
      customerId,
      productId,
      email,
      variantId
    });

    if (!customerId || !productId || !email) {
      return NextResponse.json(
        { error: 'customerId, productId, and email are required' },
        { status: 400 }
      );
    }

    // Get current customer account via Backend API
    const customer = await swellAPI.get(`/accounts/${customerId}`);
    console.log('🔍 Customer found via Backend API');

    // Get existing wantlist or create empty array
    const currentWantlist = customer.content?.wantlist || [];
    console.log('🔍 Current wantlist has:', currentWantlist.length, 'items');

    // Check if item already exists
    const existingItemIndex = currentWantlist.findIndex(
      (item) =>
        item.product_id === productId &&
        item.product_variant_id === variantId &&
        item.status === 'active'
    );

    if (existingItemIndex !== -1) {
      console.log('⚠️ Item already exists in wantlist');
      return NextResponse.json(
        { success: false, message: 'Item already in wantlist' },
        { status: 400 }
      );
    }

    // Create new wantlist item
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer_id: customerId,
      product_id: productId,
      product_variant_id: variantId,
      email: email,
      notify_when_available: true,
      date_added: new Date().toISOString(),
      status: 'active'
    };

    // Add to wantlist
    const updatedWantlist = [...currentWantlist, newItem];

    // Update customer account via Backend API
    const updatedCustomer = await swellAPI.put(`/accounts/${customerId}`, {
      content: {
        ...customer.content,
        wantlist: updatedWantlist
      }
    });

    console.log('✅ Customer updated via Backend API. Total items:', updatedWantlist.length);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('POST /api/wantlist-backend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/wantlist-backend - Remove item from wantlist via Backend API
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'customerId and productId are required' }, { status: 400 });
    }

    console.log('🔍 Removing from wantlist via Backend API:', { customerId, productId, variantId });

    // Get current customer account
    const customer = await swellAPI.get(`/accounts/${customerId}`);
    const currentWantlist = customer.content?.wantlist || [];

    // Find and mark item as removed
    const updatedWantlist = currentWantlist.map((item) => {
      if (
        item.product_id === productId &&
        item.product_variant_id === variantId &&
        item.status === 'active'
      ) {
        return { ...item, status: 'removed' };
      }
      return item;
    });

    // Update customer account via Backend API
    const updatedCustomer = await swellAPI.put(`/accounts/${customerId}`, {
      content: {
        ...customer.content,
        wantlist: updatedWantlist
      }
    });

    console.log('✅ Customer updated via Backend API - item removed');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/wantlist-backend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
