// app/api/wantlist-content/route.js - Using Swell Content Model for wantlist
import { NextResponse } from 'next/server';

class SwellBackendAPI {
  constructor() {
    this.baseURL = 'https://api.swell.store';
    this.storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    this.secretKey = process.env.SWELL_SECRET_KEY;
  }

  async request(method, endpoint, data = null, retries = 2) {
    const url = `${this.baseURL}${endpoint}`;
    const auth = Buffer.from(`${this.storeId}:${this.secretKey}`).toString('base64');

    const options = {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    console.log(`🔍 Content API Request: ${method} ${url}`);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Content API ${method} ${endpoint} failed:`, response.status, errorText);

          if (response.status >= 500 && attempt < retries) {
            console.log(`🔄 Retrying request (attempt ${attempt + 1}/${retries + 1})...`);
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          throw new Error(`Content API request failed: ${response.status} ${errorText}`);
        }

        const responseText = await response.text();
        if (!responseText.trim()) {
          return { success: true, empty: true };
        }

        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return { success: false, parseError: true, text: responseText };
        }
      } catch (error) {
        console.error(
          `❌ Content API ${method} ${endpoint} attempt ${attempt + 1} failed:`,
          error.message
        );

        if (attempt === retries) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
}

const swellAPI = new SwellBackendAPI();

// GET /api/wantlist-content - Get wantlist items from content model
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');

    // Need either customerId or email to find wantlist items
    if (!customerId && !email) {
      return NextResponse.json({ error: 'Customer ID or email required' }, { status: 400 });
    }

    console.log('🔍 Getting wantlist from content model:', { customerId, email });

    // If no email but we have a real customer ID, try to get email from customer account
    let userEmail = email && email !== 'null' ? email : null;

    if (!userEmail && customerId && !customerId.startsWith('guest_')) {
      try {
        console.log('🔍 No email provided, fetching from customer account:', customerId);
        const customer = await swellAPI.request('GET', `/accounts/${customerId}`);
        if (customer && customer.email) {
          userEmail = customer.email;
          console.log('✅ Got email from customer account:', userEmail);
        }
      } catch (error) {
        console.error('❌ Could not fetch customer email:', error.message);
      }
    }

    // Build query to find wantlist items - using content.field syntax for nested fields
    let query = 'content.status=active';
    if (customerId && !customerId.startsWith('guest_')) {
      query += `&content.customer_id=${encodeURIComponent(customerId)}`;
    }
    if (userEmail) {
      query += `&content.email=${encodeURIComponent(userEmail)}`;
    }

    console.log('🔍 Query for wantlist items:', query);

    // Get wantlist items from content model
    const wantlistResponse = await swellAPI.request('GET', `/content/wantlist?${query}&limit=100`);

    const wantlistItems = wantlistResponse.results || [];
    console.log('🔍 Found', wantlistItems.length, 'wantlist items in content model');

    if (wantlistItems.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    // Fetch product details for each item
    const itemsWithProducts = await Promise.all(
      wantlistItems.map(async (item) => {
        try {
          console.log(`🔍 Fetching product details for: ${item.product_id}`);

          const product = await swellAPI.request('GET', `/products/${item.product_id}`);
          let variant = null;

          if (item.product_variant_id && product.variants?.results) {
            variant = product.variants.results.find((v) => v.id === item.product_variant_id);
          }

          console.log(`✅ Got product details for: ${product?.name || item.product_id}`);

          return {
            id: item.id,
            customer_id: item.content?.customer_id,
            product_id: item.content?.product_id,
            product_variant_id: item.content?.product_variant_id,
            email: item.content?.email,
            notify_when_available: item.content?.notify_when_available,
            date_added: item.date_created,
            status: item.content?.status,
            product: product,
            variant: variant
          };
        } catch (error) {
          console.error('❌ Error fetching product details for:', item.product_id, error.message);
          return {
            id: item.id,
            customer_id: item.content?.customer_id,
            product_id: item.content?.product_id,
            product_variant_id: item.content?.product_variant_id,
            email: item.content?.email,
            notify_when_available: item.content?.notify_when_available,
            date_added: item.date_created,
            status: item.content?.status,
            product: null,
            variant: null
          };
        }
      })
    );

    console.log(`✅ Returning ${itemsWithProducts.length} wantlist items with product details`);

    return NextResponse.json({ success: true, items: itemsWithProducts });
  } catch (error) {
    console.error('❌ GET /api/wantlist-content error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/wantlist-content - Add item to wantlist content model
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, productId, email, variantId } = body;

    console.log('🔍 POST /api/wantlist-content received:', {
      customerId,
      productId,
      email,
      variantId
    });

    if (!productId || !email) {
      return NextResponse.json({ error: 'productId and email are required' }, { status: 400 });
    }

    // Check if item already exists - using content.field syntax
    let query = `content.status=active&content.product_id=${encodeURIComponent(
      productId
    )}&content.email=${encodeURIComponent(email)}`;
    if (variantId) {
      query += `&content.product_variant_id=${encodeURIComponent(variantId)}`;
    }

    const existingItems = await swellAPI.request('GET', `/content/wantlist?${query}`);

    if (existingItems.results && existingItems.results.length > 0) {
      console.log('⚠️ Item already exists in wantlist');
      return NextResponse.json(
        { success: false, message: 'Item already in wantlist' },
        { status: 400 }
      );
    }

    // Create new wantlist item in content model with proper structure
    const newItem = {
      content: {
        customer_id: customerId && !customerId.startsWith('guest_') ? customerId : null,
        product_id: productId,
        product_variant_id: variantId || null,
        email: email,
        notify_when_available: true,
        status: 'active'
      }
    };

    console.log('💾 Creating new wantlist item in content model:', newItem);

    const createdItem = await swellAPI.request('POST', '/content/wantlist', newItem);

    console.log('✅ Wantlist item created in content model:', createdItem.id);

    return NextResponse.json({
      success: true,
      item: {
        id: createdItem.id,
        customer_id: createdItem.content?.customer_id,
        product_id: createdItem.content?.product_id,
        product_variant_id: createdItem.content?.product_variant_id,
        email: createdItem.content?.email,
        notify_when_available: createdItem.content?.notify_when_available,
        date_added: createdItem.date_created,
        status: createdItem.content?.status
      }
    });
  } catch (error) {
    console.error('❌ POST /api/wantlist-content error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/wantlist-content - Remove item from wantlist content model
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');
    const email = searchParams.get('email');

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    console.log('🗑️ Removing from wantlist content model:', {
      customerId,
      productId,
      variantId,
      email
    });

    // Get email from customer account if not provided
    let userEmail = email && email !== 'null' ? email : null;

    if (!userEmail && customerId && !customerId.startsWith('guest_')) {
      try {
        console.log('🔍 No email provided, fetching from customer account:', customerId);
        const customer = await swellAPI.request('GET', `/accounts/${customerId}`);
        if (customer && customer.email) {
          userEmail = customer.email;
          console.log('✅ Got email from customer account:', userEmail);
        }
      } catch (error) {
        console.error('❌ Could not fetch customer email:', error.message);
      }
    }

    if (!userEmail && !customerId) {
      return NextResponse.json(
        { error: 'Either email or valid customerId is required' },
        { status: 400 }
      );
    }

    // Find the item to remove - using content.field syntax
    let query = `content.status=active&content.product_id=${encodeURIComponent(productId)}`;
    if (userEmail) {
      query += `&content.email=${encodeURIComponent(userEmail)}`;
    }
    if (customerId && !customerId.startsWith('guest_')) {
      query += `&content.customer_id=${encodeURIComponent(customerId)}`;
    }
    if (variantId) {
      query += `&content.product_variant_id=${encodeURIComponent(variantId)}`;
    }

    console.log('🔍 Query to find item for removal:', query);

    const existingItems = await swellAPI.request('GET', `/content/wantlist?${query}`);

    if (!existingItems.results || existingItems.results.length === 0) {
      console.log('⚠️ Item not found in wantlist');
      return NextResponse.json(
        { success: false, error: 'Item not found in wantlist' },
        { status: 404 }
      );
    }

    const itemToRemove = existingItems.results[0];
    console.log('🎯 Found item to remove:', itemToRemove.id);

    // Update item status to 'removed' instead of deleting
    const updatedItem = await swellAPI.request('PUT', `/content/wantlist/${itemToRemove.id}`, {
      content: {
        ...itemToRemove.content,
        status: 'removed'
      }
    });

    console.log('✅ Wantlist item marked as removed in content model');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /api/wantlist-content error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
