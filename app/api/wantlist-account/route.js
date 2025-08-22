// app/api/wantlist-account/route.js - FIXED with withCredentials
import { NextResponse } from 'next/server';

const backendAPI = {
  async request(method, endpoint, data) {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    const publicKey = process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY; // Use PUBLIC key as the error suggests!

    if (!storeId || !publicKey) {
      console.error('❌ Missing credentials:', {
        hasStoreId: !!storeId,
        hasPublicKey: !!publicKey
      });
      throw new Error('Missing Swell credentials - need PUBLIC key');
    }

    const url = `https://${storeId}.swell.store/api${endpoint}`;
    const options = {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${storeId}:${publicKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // THIS IS THE KEY! Equivalent to withCredentials: true
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    console.log(`🔍 Account API Request with credentials: ${method} ${url}`);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Account API ${method} ${endpoint} failed:`, response.status, errorText);
      throw new Error(`Account API request failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Account API ${method} ${endpoint} success:`, result.id || 'success');
    return result;
  },

  async get(endpoint) {
    return this.request('GET', endpoint);
  },

  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }
};

// GET /api/wantlist-account - Get customer's wantlist from account content
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    console.log('🔍 Getting wantlist for customer via account (with credentials):', customerId);

    // Get customer account with content
    const customer = await backendAPI.get(`/accounts/${customerId}`);
    console.log('🔍 Customer found, checking content...');

    // Extract wantlist from customer content
    const wantlistData = customer.content?.wantlist || [];
    console.log('🔍 Raw wantlist data from account:', wantlistData.length, 'items');

    if (!Array.isArray(wantlistData) || wantlistData.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    // Filter active items
    const activeItems = wantlistData.filter((item) => item.status === 'active');
    console.log('🔍 Active items:', activeItems.length);

    // For now, return items without fetching full product details to avoid additional API calls
    const itemsWithBasicInfo = activeItems.map((item) => ({
      id: item.id || `${item.product_id}-${item.product_variant_id || 'no-variant'}`,
      ...item
    }));

    return NextResponse.json({ success: true, items: itemsWithBasicInfo });
  } catch (error) {
    console.error('GET /api/wantlist-account error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/wantlist-account - Add item to wantlist via account content
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, productId, email, variantId } = body;

    console.log('🔍 POST /api/wantlist-account received:', {
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

    // Get current customer account
    const customer = await backendAPI.get(`/accounts/${customerId}`);
    console.log('🔍 Customer found, current content keys:', Object.keys(customer.content || {}));

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

    // Update customer account with new wantlist
    const updatedCustomer = await backendAPI.put(`/accounts/${customerId}`, {
      content: {
        ...customer.content,
        wantlist: updatedWantlist
      }
    });

    console.log('✅ Customer updated with new wantlist item. Total items:', updatedWantlist.length);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('POST /api/wantlist-account error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/wantlist-account - Remove item from wantlist via account content
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'customerId and productId are required' }, { status: 400 });
    }

    console.log('🔍 Removing from wantlist via account:', { customerId, productId, variantId });

    // Get current customer account
    const customer = await backendAPI.get(`/accounts/${customerId}`);
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

    // Update customer account
    const updatedCustomer = await backendAPI.put(`/accounts/${customerId}`, {
      content: {
        ...customer.content,
        wantlist: updatedWantlist
      }
    });

    console.log('✅ Customer updated - item removed from wantlist');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/wantlist-account error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
