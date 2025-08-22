// app/api/wantlist-model/route.js - Using wantlist custom model instead of account content
import { NextResponse } from 'next/server';

class SwellBackendAPI {
  constructor() {
    this.baseURL = 'https://api.swell.store';
    this.storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    this.secretKey = process.env.SWELL_SECRET_KEY;

    console.log('🔍 SwellBackendAPI initialization for custom model:');
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

    // Use Basic Authentication as shown in Swell docs
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

    console.log(`🔍 Custom Model API Request: ${method} ${url}`);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Custom Model API ${method} ${endpoint} failed:`,
        response.status,
        errorText
      );
      throw new Error(`Custom Model API request failed: ${response.status} ${errorText}`);
    }

    // Handle empty responses gracefully
    const responseText = await response.text();
    if (!responseText.trim()) {
      console.log(`✅ Custom Model API ${method} ${endpoint} success (empty response)`);
      return {};
    }

    try {
      const result = JSON.parse(responseText);
      console.log(`✅ Custom Model API ${method} ${endpoint} success`);
      return result;
    } catch (parseError) {
      console.error(`❌ JSON parse error for ${method} ${endpoint}:`, parseError);
      console.error(`Response text:`, responseText);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
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

  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

const swellAPI = new SwellBackendAPI();

// GET /api/wantlist-model - Get customer's wantlist from custom model
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    console.log('🔍 Getting wantlist from custom model for customer:', customerId);

    // Query the wantlist custom model for this customer
    const wantlistQuery = await swellAPI.get(
      `/content/wantlist?where[customer_id]=${customerId}&where[status]=active`
    );

    console.log('🔍 Custom model query result:', wantlistQuery.count || 0, 'items');

    const items = wantlistQuery.results || [];

    // Fetch product details for each wantlist item
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        try {
          const product = await swellAPI.get(`/products/${item.content.product_id}`);
          let variant = null;

          if (item.content.product_variant_id && product.variants?.results) {
            variant = product.variants.results.find(
              (v) => v.id === item.content.product_variant_id
            );
          }

          return {
            id: item.id,
            customer_id: item.content.customer_id,
            product_id: item.content.product_id,
            product_variant_id: item.content.product_variant_id,
            email: item.content.email,
            notify_when_available: item.content.notify_when_available,
            date_added: item.content.date_added,
            status: item.content.status,
            product,
            variant
          };
        } catch (error) {
          console.error('Error fetching product for wantlist item:', error);
          return {
            id: item.id,
            customer_id: item.content.customer_id,
            product_id: item.content.product_id,
            product_variant_id: item.content.product_variant_id,
            email: item.content.email,
            notify_when_available: item.content.notify_when_available,
            date_added: item.content.date_added,
            status: item.content.status,
            product: null,
            variant: null
          };
        }
      })
    );

    return NextResponse.json({ success: true, items: itemsWithProducts });
  } catch (error) {
    console.error('GET /api/wantlist-model error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/wantlist-model - Add item to wantlist custom model
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, productId, email, variantId } = body;

    console.log('🔍 POST /api/wantlist-model received:', {
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

    // Check if item already exists in custom model
    const existingQuery = await swellAPI.get(
      `/content/wantlist?where[customer_id]=${customerId}&where[product_id]=${productId}&where[status]=active` +
        (variantId ? `&where[product_variant_id]=${variantId}` : '')
    );

    if (existingQuery.results && existingQuery.results.length > 0) {
      console.log('⚠️ Item already exists in wantlist custom model');
      return NextResponse.json(
        { success: false, message: 'Item already in wantlist' },
        { status: 400 }
      );
    }

    // Create new wantlist item in custom model
    const newWantlistItem = await swellAPI.post('/content/wantlist', {
      customer_id: customerId,
      product_id: productId,
      product_variant_id: variantId,
      email: email,
      notify_when_available: true,
      date_added: new Date().toISOString(),
      status: 'active'
    });

    console.log('✅ Wantlist item created in custom model:', newWantlistItem.id);

    return NextResponse.json({
      success: true,
      item: {
        id: newWantlistItem.id,
        customer_id: customerId,
        product_id: productId,
        product_variant_id: variantId,
        email: email,
        notify_when_available: true,
        date_added: newWantlistItem.date_added,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('POST /api/wantlist-model error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/wantlist-model - Remove item from wantlist custom model
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'customerId and productId are required' }, { status: 400 });
    }

    console.log('🔍 Removing from wantlist custom model:', { customerId, productId, variantId });

    // Find the wantlist item in custom model
    const existingQuery = await swellAPI.get(
      `/content/wantlist?where[customer_id]=${customerId}&where[product_id]=${productId}&where[status]=active` +
        (variantId ? `&where[product_variant_id]=${variantId}` : '')
    );

    if (!existingQuery.results || existingQuery.results.length === 0) {
      console.log('⚠️ Item not found in wantlist custom model');
      return NextResponse.json(
        { success: false, message: 'Item not found in wantlist' },
        { status: 404 }
      );
    }

    const wantlistItem = existingQuery.results[0];

    // Update the status to 'removed' instead of deleting
    await swellAPI.put(`/content/wantlist/${wantlistItem.id}`, {
      customer_id: wantlistItem.customer_id,
      product_id: wantlistItem.product_id,
      product_variant_id: wantlistItem.product_variant_id,
      email: wantlistItem.email,
      notify_when_available: wantlistItem.notify_when_available,
      date_added: wantlistItem.date_added,
      status: 'removed'
    });

    console.log('✅ Wantlist item marked as removed in custom model');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/wantlist-model error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
