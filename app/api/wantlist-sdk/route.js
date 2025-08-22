// app/api/wantlist-sdk/route.js - Using swell-node SDK instead of raw API
import { NextResponse } from 'next/server';

let swell;

// Initialize Swell SDK
function initSwell() {
  if (!swell) {
    try {
      // Try to import swell-node
      const swellNode = require('swell-node');
      swell = swellNode;

      const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
      const secretKey = process.env.SWELL_SECRET_KEY;

      if (!storeId || !secretKey) {
        throw new Error('Missing Swell credentials');
      }

      swell.init(storeId, secretKey);
      console.log('✅ Swell SDK initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Swell SDK:', error);
      throw error;
    }
  }
  return swell;
}

// Alternative: Use swell-js for frontend API
async function getCustomerWithSwellJS(customerId) {
  try {
    // This might work better since it's designed for frontend use
    const swellClient = require('swell-js');

    swellClient.init(
      process.env.NEXT_PUBLIC_SWELL_STORE_ID,
      process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY
    );

    // Try to get customer account
    const customer = await swellClient.account.get(customerId);
    return customer;
  } catch (error) {
    console.error('❌ swell-js customer fetch failed:', error);
    throw error;
  }
}

// GET /api/wantlist-sdk - Get customer's wantlist using SDK
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    console.log('🔍 Getting wantlist for customer via SDK:', customerId);

    let customer;

    try {
      // First try with swell-node SDK
      const swellSDK = initSwell();
      customer = await swellSDK.get('/accounts/{id}', { id: customerId });
      console.log('✅ Got customer via swell-node SDK');
    } catch (error) {
      console.log('❌ swell-node failed, trying swell-js...');

      try {
        customer = await getCustomerWithSwellJS(customerId);
        console.log('✅ Got customer via swell-js');
      } catch (jsError) {
        console.error('❌ Both SDKs failed:', {
          nodeError: error.message,
          jsError: jsError.message
        });
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch customer data with both SDKs',
            details: { nodeError: error.message, jsError: jsError.message }
          },
          { status: 500 }
        );
      }
    }

    // Extract wantlist from customer content
    const wantlistData = customer.content?.wantlist || [];
    console.log('🔍 Found wantlist data:', wantlistData.length, 'items');

    // Filter active items
    const activeItems = wantlistData.filter((item) => item.status === 'active');

    return NextResponse.json({
      success: true,
      items: activeItems,
      source: 'SDK'
    });
  } catch (error) {
    console.error('GET /api/wantlist-sdk error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/wantlist-sdk - Add item to wantlist using SDK
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId, productId, email, variantId } = body;

    console.log('🔍 POST /api/wantlist-sdk received:', { customerId, productId, email, variantId });

    if (!customerId || !productId || !email) {
      return NextResponse.json(
        { error: 'customerId, productId, and email are required' },
        { status: 400 }
      );
    }

    let customer, updatedCustomer;

    try {
      // Try with swell-node SDK
      const swellSDK = initSwell();

      customer = await swellSDK.get('/accounts/{id}', { id: customerId });
      console.log('✅ Got customer via swell-node SDK');

      // Get existing wantlist or create empty array
      const currentWantlist = customer.content?.wantlist || [];

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

      // Update customer account
      updatedCustomer = await swellSDK.put('/accounts/{id}', {
        id: customerId,
        content: {
          ...customer.content,
          wantlist: updatedWantlist
        }
      });

      console.log('✅ Customer updated with new wantlist item via SDK');

      return NextResponse.json({ success: true, item: newItem, source: 'SDK' });
    } catch (error) {
      console.error('❌ SDK operation failed:', error);
      return NextResponse.json(
        {
          success: false,
          error: `SDK error: ${error.message}`
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('POST /api/wantlist-sdk error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
