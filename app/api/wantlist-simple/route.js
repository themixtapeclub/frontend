// app/api/wantlist-simple/route.js - FIXED VERSION with better error handling
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
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(15000) // 15 second timeout
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    console.log(`🔍 Simple API Request: ${method} ${url}`);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Simple API ${method} ${endpoint} failed:`, response.status, errorText);

          // If it's a timeout or server error, retry
          if (response.status >= 500 && attempt < retries) {
            console.log(`🔄 Retrying request (attempt ${attempt + 1}/${retries + 1})...`);
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }

          throw new Error(`Simple API request failed: ${response.status} ${errorText}`);
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
          `❌ Simple API ${method} ${endpoint} attempt ${attempt + 1} failed:`,
          error.message
        );

        if (attempt === retries) {
          throw error; // Final attempt failed
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
}

const swellAPI = new SwellBackendAPI();

// GET /api/wantlist-simple - Get customer's wantlist from account metadata
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    console.log('🔍 Getting wantlist from account metadata:', customerId);

    // Handle guest users
    if (customerId.startsWith('guest_')) {
      console.log('👤 Guest user detected, returning empty wantlist');
      return NextResponse.json({ success: true, items: [] });
    }

    // Get customer account
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    if (!customer || customer.empty) {
      console.log('❌ Customer not found, returning empty wantlist');
      return NextResponse.json({ success: true, items: [] });
    }

    // Get wantlist from account metadata or content
    const wantlistData = customer.metadata?.wantlist || customer.content?.wantlist || [];

    console.log('🔍 Found wantlist data:', wantlistData.length, 'total items');

    // Debug: Show all items and their statuses
    wantlistData.forEach((item, index) => {
      console.log(
        `📋 Item ${index}: ID=${item.product_id}, variant=${item.product_variant_id}, status=${item.status}, date_added=${item.date_added}`
      );
    });

    // Filter ONLY active items - this is the key fix!
    const activeItems = wantlistData.filter((item) => {
      const isActive = item.status === 'active';
      console.log(
        `🔍 Filtering Item ${item.product_id}: status="${item.status}", isActive=${isActive}`
      );
      return isActive;
    });

    console.log(
      '✅ After filtering:',
      activeItems.length,
      'active items out of',
      wantlistData.length,
      'total items'
    );

    console.log(
      '🔍 Found',
      activeItems.length,
      'active items after filtering, fetching product details...'
    );

    if (activeItems.length === 0) {
      console.log('✅ No active items, returning empty list');
      return NextResponse.json({ success: true, items: [] });
    }

    // Fetch product details for each item with better error handling
    const itemsWithProducts = await Promise.all(
      activeItems.map(async (item) => {
        try {
          console.log(`🔍 Fetching product details for: ${item.product_id}`);

          // Fetch product details with retry
          const product = await swellAPI.request('GET', `/products/${item.product_id}`);
          let variant = null;

          // Fetch variant details if specified
          if (item.product_variant_id && product.variants?.results) {
            variant = product.variants.results.find((v) => v.id === item.product_variant_id);
          }

          console.log(`✅ Got product details for: ${product?.name || item.product_id}`);

          return {
            ...item,
            product: product,
            variant: variant
          };
        } catch (error) {
          console.error('❌ Error fetching product details for:', item.product_id, error.message);
          return {
            ...item,
            product: null,
            variant: null
          };
        }
      })
    );

    console.log(`✅ Returning ${itemsWithProducts.length} items with product details`);

    return NextResponse.json({ success: true, items: itemsWithProducts });
  } catch (error) {
    console.error('❌ GET /api/wantlist-simple error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/wantlist-simple - Add item to wantlist via account metadata
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, productId, email, variantId } = body;

    console.log('🔍 POST /api/wantlist-simple received:', {
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

    // Handle guest users
    if (customerId.startsWith('guest_')) {
      console.log('👤 Guest user detected, creating customer account for:', email);

      try {
        // Create a new customer account for the guest
        const newCustomer = await swellAPI.request('POST', '/accounts', {
          email: email,
          email_optin: true,
          metadata: {
            wantlist: []
          }
        });

        console.log('✅ Created new customer account:', newCustomer.id);

        // Create wantlist item for the new customer
        const newItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          customer_id: newCustomer.id,
          product_id: productId,
          product_variant_id: variantId || null,
          email: email,
          notify_when_available: true,
          date_added: new Date().toISOString(),
          status: 'active'
        };

        // Add item to the new customer's wantlist
        const updatedCustomer = await swellAPI.request('PUT', `/accounts/${newCustomer.id}`, {
          metadata: {
            wantlist: [newItem]
          }
        });

        console.log('✅ Wantlist item added for new customer');

        return NextResponse.json({
          success: true,
          item: newItem,
          customerId: newCustomer.id // Return the real customer ID
        });
      } catch (guestError) {
        console.error('❌ Error handling guest user:', guestError);

        // Fallback: try to find existing customer by email
        try {
          console.log('🔍 Trying to find existing customer by email:', email);
          const existingCustomers = await swellAPI.request(
            'GET',
            `/accounts?email=${encodeURIComponent(email)}&limit=1`
          );

          if (existingCustomers.results && existingCustomers.results.length > 0) {
            const customer = existingCustomers.results[0];
            console.log('✅ Found existing customer:', customer.id);

            // Continue with normal flow using existing customer
            const currentWantlist = customer.metadata?.wantlist || customer.content?.wantlist || [];

            // Check if item already exists
            const existingActiveItem = currentWantlist.find((item) => {
              const productMatch = item.product_id === productId;
              const variantMatch =
                item.product_variant_id === variantId ||
                ((!item.product_variant_id || item.product_variant_id === undefined) &&
                  (!variantId || variantId === null));
              return productMatch && variantMatch && item.status === 'active';
            });

            if (existingActiveItem) {
              return NextResponse.json(
                { success: false, message: 'Item already in wantlist' },
                { status: 400 }
              );
            }

            // Add new item
            const newItem = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              customer_id: customer.id,
              product_id: productId,
              product_variant_id: variantId || null,
              email: email,
              notify_when_available: true,
              date_added: new Date().toISOString(),
              status: 'active'
            };

            const updatedWantlist = [...currentWantlist, newItem];

            await swellAPI.request('PUT', `/accounts/${customer.id}`, {
              metadata: {
                ...customer.metadata,
                wantlist: updatedWantlist
              }
            });

            return NextResponse.json({
              success: true,
              item: newItem,
              customerId: customer.id
            });
          }
        } catch (findError) {
          console.error('❌ Error finding customer by email:', findError);
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Unable to create or find customer account'
          },
          { status: 500 }
        );
      }
    }

    // Regular customer flow (existing code)
    // Get current customer account
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    if (!customer || customer.empty) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    if (!customer || customer.empty) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Get existing wantlist from metadata (fallback to content)
    const currentWantlist = customer.metadata?.wantlist || customer.content?.wantlist || [];

    console.log('🔍 Current wantlist has:', currentWantlist.length, 'total items');

    // Check if item already exists as ACTIVE with better variant matching
    const existingActiveItem = currentWantlist.find((item) => {
      const productMatch = item.product_id === productId;
      const variantMatch =
        item.product_variant_id === variantId ||
        ((!item.product_variant_id || item.product_variant_id === undefined) &&
          (!variantId || variantId === null));
      return productMatch && variantMatch && item.status === 'active';
    });

    if (existingActiveItem) {
      console.log('⚠️ Item already exists as active in wantlist');
      return NextResponse.json(
        { success: false, message: 'Item already in wantlist' },
        { status: 400 }
      );
    }

    // Create new wantlist item with normalized variant
    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer_id: customerId,
      product_id: productId,
      product_variant_id: variantId || null, // Normalize undefined to null
      email: email,
      notify_when_available: true,
      date_added: new Date().toISOString(),
      status: 'active'
    };

    // Add to wantlist
    const updatedWantlist = [...currentWantlist, newItem];

    console.log('💾 Updating wantlist. Total items will be:', updatedWantlist.length);

    // Try to update metadata first, fallback to content
    let updateData = {};

    if (customer.metadata) {
      updateData.metadata = {
        ...customer.metadata,
        wantlist: updatedWantlist
      };
    } else {
      updateData.content = {
        ...customer.content,
        wantlist: updatedWantlist
      };
    }

    // Update customer account with retry
    const updatedCustomer = await swellAPI.request('PUT', `/accounts/${customerId}`, updateData);

    console.log('✅ Wantlist item added via simple API. Total items:', updatedWantlist.length);

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('❌ POST /api/wantlist-simple error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/wantlist-simple - Remove item from wantlist
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'customerId and productId are required' }, { status: 400 });
    }

    console.log('🗑️ Removing from wantlist via simple API:', { customerId, productId, variantId });

    // Handle guest users
    if (customerId.startsWith('guest_')) {
      console.log('👤 Guest user detected, cannot remove from wantlist');
      return NextResponse.json(
        { success: false, error: 'Guest users cannot manage wantlist' },
        { status: 400 }
      );
    }

    // Get current customer account
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    if (!customer || customer.empty) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const currentWantlist = customer.metadata?.wantlist || customer.content?.wantlist || [];

    console.log('🔍 Current wantlist before removal:', currentWantlist.length, 'items');

    // Debug: Show all items and their statuses
    currentWantlist.forEach((item, index) => {
      console.log(
        `📋 Item ${index}: ID=${item.product_id}, variant=${item.product_variant_id}, status=${item.status}`
      );
    });

    // Find the target item regardless of status first
    const targetItem = currentWantlist.find((item) => {
      const productMatch = item.product_id === productId;
      // More precise variant matching - don't treat null and undefined as always equivalent
      let variantMatch;
      if (variantId === null || variantId === undefined) {
        // Looking for no variant - match null, undefined, or empty string
        variantMatch =
          !item.product_variant_id ||
          item.product_variant_id === null ||
          item.product_variant_id === undefined ||
          item.product_variant_id === '';
      } else {
        // Looking for specific variant - exact match only
        variantMatch = item.product_variant_id === variantId;
      }

      // For debugging
      console.log(
        `🔍 Checking item: product=${item.product_id}, variant="${item.product_variant_id}", status=${item.status}`
      );
      console.log(`🔍 Looking for: product=${productId}, variant="${variantId}"`);
      console.log(`🔍 Match result: product=${productMatch}, variant=${variantMatch}`);

      return productMatch && variantMatch && item.status === 'active'; // Only match active items
    });

    if (targetItem) {
      console.log(
        `🎯 Found target ACTIVE item: ID=${targetItem.id}, status=${targetItem.status}, variant="${targetItem.product_variant_id}"`
      );
    } else {
      console.log('❌ No active item found with matching product and variant');

      // Show what we do have for this product
      const allItemsForProduct = currentWantlist.filter((item) => item.product_id === productId);
      console.log(
        `📋 All items for product ${productId}:`,
        allItemsForProduct.map(
          (item) => `variant="${item.product_variant_id}", status=${item.status}`
        )
      );

      return NextResponse.json(
        { success: false, error: 'Active item not found in wantlist' },
        { status: 404 }
      );
    }

    // Find and mark item as removed with precise variant matching
    let itemFound = false;
    const updatedWantlist = currentWantlist.map((item) => {
      const productMatch = item.product_id === productId;
      let variantMatch;
      if (variantId === null || variantId === undefined) {
        variantMatch =
          !item.product_variant_id ||
          item.product_variant_id === null ||
          item.product_variant_id === undefined ||
          item.product_variant_id === '';
      } else {
        variantMatch = item.product_variant_id === variantId;
      }
      const isTargetItem = productMatch && variantMatch && item.status === 'active';

      if (isTargetItem) {
        console.log(
          '🎯 Found target item to remove:',
          item.id,
          'variant:',
          item.product_variant_id
        );
        itemFound = true;
        return { ...item, status: 'removed', date_removed: new Date().toISOString() };
      }
      return item;
    });

    if (!itemFound) {
      console.log('⚠️ Item not found in active wantlist');
      return NextResponse.json(
        { success: false, error: 'Item not found in wantlist' },
        { status: 404 }
      );
    }

    // Count active items after update
    const activeCount = updatedWantlist.filter((item) => item.status === 'active').length;
    console.log('📊 After removal, active items:', activeCount);

    // Update customer account
    let updateData = {};

    if (customer.metadata) {
      updateData.metadata = {
        ...customer.metadata,
        wantlist: updatedWantlist
      };
    } else {
      updateData.content = {
        ...customer.content,
        wantlist: updatedWantlist
      };
    }

    console.log('💾 Updating customer account with removed item...');
    const updatedCustomer = await swellAPI.request('PUT', `/accounts/${customerId}`, updateData);

    console.log('✅ Wantlist item successfully marked as removed via simple API');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE /api/wantlist-simple error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
