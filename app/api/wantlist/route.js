// app/api/wantlist/route.js - PERMANENT DELETE approach (Swell query filtering is broken)
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

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();

          if (response.status >= 500 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          throw new Error(`Wantlist API request failed: ${response.status} ${errorText}`);
        }

        const responseText = await response.text();

        if (!responseText.trim()) {
          return { success: true, empty: true };
        }

        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          return { success: false, parseError: true, text: responseText };
        }
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
}

const swellAPI = new SwellBackendAPI();

// Helper function to normalize variant values
const normalizeVariant = (variant) => {
  if (!variant || variant === 'undefined' || variant === 'null') return null;
  return variant;
};

// Helper function to match variants properly
const variantsMatch = (variant1, variant2) => {
  const norm1 = normalizeVariant(variant1);
  const norm2 = normalizeVariant(variant2);
  return norm1 === norm2;
};

// GET /api/wantlist - Get customer's wantlist with client-side filtering (since Swell queries are broken)
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const email = searchParams.get('email');

    if (!customerId && !email) {
      return NextResponse.json({ error: 'Customer ID or email required' }, { status: 400 });
    }

    // Handle guest users - they can VIEW their wantlist

    // SWELL'S QUERY FILTERING IS COMPLETELY BROKEN - Get ALL items and filter client-side

    // Get ALL wantlist items (no filtering - Swell can't be trusted)
    const allWantlistResponse = await swellAPI.request('GET', `/wantlist?limit=100`);

    const allItems = allWantlistResponse.results || [];

    // CLIENT-SIDE FILTERING: Filter by customer ID (and email if provided)
    const customerItems = allItems.filter((item) => {
      const customerMatch = customerId ? item.content?.customer_id === customerId : true;
      const emailMatch = email ? item.content?.email === email : true;
      return customerMatch && emailMatch;
    });

    // Filter only active items
    const activeItems = customerItems.filter((item) => {
      const status = item.content?.status;
      const isActive = status === 'active';
      return isActive;
    });

    if (activeItems.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }

    // Fetch product details for each active item
    const itemsWithProducts = await Promise.all(
      activeItems.map(async (item) => {
        try {
          const content = item.content;
          const product = await swellAPI.request('GET', `/products/${content.product_id}`);
          let variant = null;

          if (content.product_variant_id && product.variants?.results) {
            variant = product.variants.results.find((v) => v.id === content.product_variant_id);
          }

          return {
            id: item.id,
            customer_id: content.customer_id,
            product_id: content.product_id,
            product_variant_id: normalizeVariant(content.product_variant_id),
            email: content.email,
            notify_when_available: content.notify_when_available,
            date_added: content.date_added,
            status: content.status,
            product: product,
            variant: variant
          };
        } catch (error) {
          const content = item.content;
          return {
            id: item.id,
            customer_id: content?.customer_id,
            product_id: content?.product_id,
            product_variant_id: normalizeVariant(content?.product_variant_id),
            email: content?.email,
            notify_when_available: content?.notify_when_available,
            date_added: content?.date_added,
            status: content?.status,
            product: null,
            variant: null
          };
        }
      })
    );

    return NextResponse.json({ success: true, items: itemsWithProducts });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/wantlist - Add item with cleanup of old items
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, productId, email, variantId } = body;

    if (!productId || !email) {
      return NextResponse.json({ error: 'productId and email are required' }, { status: 400 });
    }

    const normalizedVariantId = normalizeVariant(variantId);

    // Handle guest users - they can ADD to wantlist
    let finalCustomerId = customerId;
    if (!customerId || customerId.startsWith('guest_')) {
      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Valid email is required for guest users' },
          { status: 400 }
        );
      }

      try {
        // Try to find existing customer by email first
        const existingCustomers = await swellAPI.request(
          'GET',
          `/accounts?email=${encodeURIComponent(email)}&limit=1`
        );

        let customer;
        if (existingCustomers.results && existingCustomers.results.length > 0) {
          customer = existingCustomers.results[0];
        } else {
          // Create new customer with minimal required fields
          const newCustomerData = {
            email: email,
            email_optin: true,
            name: email.split('@')[0]
          };

          customer = await swellAPI.request('POST', '/accounts', newCustomerData);
        }

        if (!customer || !customer.id) {
          throw new Error('Customer creation/lookup returned invalid data');
        }

        finalCustomerId = customer.id;
      } catch (guestError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unable to create or find customer account: ' + guestError.message,
            details: guestError.message
          },
          { status: 500 }
        );
      }
    }

    // SWELL'S QUERY FILTERING IS COMPLETELY BROKEN - Get ALL items and filter client-side

    // Get ALL wantlist items for any customer (no filtering - Swell can't be trusted)
    const allItems = await swellAPI.request('GET', `/wantlist?limit=100`);

    // CLIENT-SIDE FILTERING: Filter by customer ID AND product ID
    const matchingItems = (allItems.results || []).filter((item) => {
      const customerMatch = item.content?.customer_id === finalCustomerId;
      const productMatch = item.content?.product_id === productId;
      const variantMatch = normalizedVariantId
        ? item.content?.product_variant_id === normalizedVariantId
        : !item.content?.product_variant_id || item.content?.product_variant_id === null;
      return customerMatch && productMatch && variantMatch;
    });

    const activeItems = matchingItems.filter((item) => item.content?.status === 'active');

    if (activeItems.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Item already in wantlist' },
        { status: 400 }
      );
    }

    // CLEANUP: Permanently delete any old removed items
    const removedItems = matchingItems.filter((item) => item.content?.status === 'removed');

    for (const removedItem of removedItems) {
      try {
        await swellAPI.request('DELETE', `/wantlist/${removedItem.id}`);
      } catch (deleteError) {
        // continue
      }
    }

    // Create new wantlist item
    const wantlistItemData = {
      content: {
        customer_id: finalCustomerId,
        product_id: productId,
        product_variant_id: normalizedVariantId,
        email: email,
        notify_when_available: true,
        date_added: new Date().toISOString(),
        status: 'active'
      }
    };

    const newWantlistItem = await swellAPI.request('POST', '/wantlist', wantlistItemData);

    return NextResponse.json({
      success: true,
      item: {
        id: newWantlistItem.id,
        customer_id: finalCustomerId,
        product_id: productId,
        product_variant_id: normalizedVariantId,
        email: email,
        notify_when_available: true,
        date_added: new Date().toISOString(),
        status: 'active'
      },
      customerId: finalCustomerId
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/wantlist - Permanently delete items
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

    const normalizedVariantId = normalizeVariant(variantId);

    // Handle guest users
    if (!customerId || customerId.startsWith('guest_')) {
      return NextResponse.json(
        { success: false, error: 'Guest users cannot manage wantlist' },
        { status: 400 }
      );
    }

    // SWELL'S QUERY FILTERING IS COMPLETELY BROKEN - Get ALL items and filter client-side

    // Get ALL wantlist items (no filtering - Swell can't be trusted)
    const allItems = await swellAPI.request('GET', `/wantlist?limit=100`);

    // CLIENT-SIDE FILTERING: Find items matching customer + product + variant
    const matchingItems = (allItems.results || []).filter((item) => {
      const customerMatch = item.content?.customer_id === customerId;
      const productMatch = item.content?.product_id === productId;
      const variantMatch = normalizedVariantId
        ? item.content?.product_variant_id === normalizedVariantId
        : !item.content?.product_variant_id || item.content?.product_variant_id === null;
      return customerMatch && productMatch && variantMatch;
    });

    // Client-side filtering for active items
    const activeItems = matchingItems.filter((item) => item.content?.status === 'active');

    if (activeItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Item not found in wantlist' },
        { status: 404 }
      );
    }

    // Permanently delete ALL instances (active and removed)
    let deletedCount = 0;

    for (const item of matchingItems) {
      try {
        await swellAPI.request('DELETE', `/wantlist/${item.id}`);
        deletedCount++;
      } catch (deleteError) {
        // continue
      }
    }

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
