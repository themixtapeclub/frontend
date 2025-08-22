// app/api/migrate-fixed/route.js - Fixed migration with correct content structure
import { NextResponse } from 'next/server';

class SwellBackendAPI {
  constructor() {
    this.baseURL = 'https://api.swell.store';
    this.storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    this.secretKey = process.env.SWELL_SECRET_KEY;
  }

  async request(method, endpoint, data = null) {
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

    console.log(`🔍 Fixed Migration API Request: ${method} ${url}`);
    console.log(`📝 Request payload:`, JSON.stringify(data, null, 2));

    const response = await fetch(url, options);
    const responseText = await response.text();

    console.log(`📋 Response status: ${response.status}`);
    console.log(`📋 Response text: ${responseText}`);

    if (!response.ok) {
      console.error(
        `❌ Fixed Migration API ${method} ${endpoint} failed:`,
        response.status,
        responseText
      );
      throw new Error(`Fixed Migration API request failed: ${response.status} ${responseText}`);
    }

    if (!responseText.trim()) {
      return { success: true, empty: true };
    }

    try {
      const parsed = JSON.parse(responseText);
      console.log(`✅ Parsed response:`, parsed);
      return parsed;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return { success: false, parseError: true, text: responseText };
    }
  }
}

const swellAPI = new SwellBackendAPI();

// GET /api/migrate-fixed - Fixed migration with correct content structure
export async function GET(request) {
  try {
    const customerId = '685cc1e3cc61440012943e02';
    console.log('🚀 Starting FIXED migration for customer:', customerId);

    // Step 1: Get customer account
    console.log('📋 Step 1: Getting customer account...');
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    if (!customer || customer.empty) {
      return NextResponse.json({ success: false, error: 'Customer not found' });
    }

    console.log('✅ Customer found:', {
      id: customer.id,
      email: customer.email,
      hasMetadata: !!customer.metadata,
      hasContent: !!customer.content
    });

    // Step 2: Get existing wantlist data
    console.log('📋 Step 2: Checking for existing wantlist data...');
    const existingWantlist = customer.content?.wantlist || [];

    console.log('📋 Found wantlist data:');
    existingWantlist.forEach((item, index) => {
      console.log(
        `  ${index}: product=${item.product_id}, variant=${item.product_variant_id}, status=${item.status}, email=${item.email}`
      );
    });

    // Step 3: Filter active items
    const activeItems = existingWantlist.filter((item) => item.status === 'active');
    console.log('📋 Step 3: Found', activeItems.length, 'active items to migrate');

    if (activeItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active items to migrate'
      });
    }

    // Step 4: Migrate with CORRECT content structure
    console.log('📋 Step 4: Starting migration with CORRECT content structure...');
    let migrated = 0;
    const errors = [];

    for (const item of activeItems) {
      try {
        console.log(`🔄 Migrating: ${item.product_id}`);

        // CORRECT structure with content wrapper
        const contentItem = {
          content: {
            customer_id: customerId,
            product_id: item.product_id,
            product_variant_id: item.product_variant_id || null,
            email: customer.email,
            notify_when_available: item.notify_when_available || true,
            status: 'active'
          }
        };

        console.log(
          '📝 Creating content item with CORRECT structure:',
          JSON.stringify(contentItem, null, 2)
        );

        const createdItem = await swellAPI.request('POST', '/content/wantlist', contentItem);

        if (createdItem && createdItem.id) {
          console.log(`✅ Successfully migrated ${item.product_id} -> ${createdItem.id}`);
          console.log('✅ Created item details:', JSON.stringify(createdItem, null, 2));
          migrated++;
        } else {
          console.error(`❌ Failed to create content item for ${item.product_id}:`, createdItem);
          errors.push(
            `Failed to create content item for ${item.product_id}: ${JSON.stringify(createdItem)}`
          );
        }
      } catch (error) {
        console.error(`❌ Error migrating ${item.product_id}:`, error.message);
        console.error(`❌ Full error details:`, error);
        errors.push(`Error migrating ${item.product_id}: ${error.message}`);
      }
    }

    // Step 5: Verify migration with correct query syntax
    console.log('📋 Step 5: Verifying migration with correct query...');
    const verifyQuery = `content.status=active&content.customer_id=${encodeURIComponent(
      customerId
    )}`;
    console.log('📋 Verification query:', verifyQuery);

    const verifyResult = await swellAPI.request(
      'GET',
      `/content/wantlist?${verifyQuery}&limit=100`
    );
    const newItems = verifyResult.results || [];

    console.log('✅ Migration completed:', {
      attempted: activeItems.length,
      migrated: migrated,
      errors: errors.length,
      verified: newItems.length
    });

    return NextResponse.json({
      success: true,
      customer: { id: customer.id, email: customer.email },
      migration: {
        attempted: activeItems.length,
        migrated: migrated,
        errors: errors.length,
        verified: newItems.length
      },
      errors: errors,
      verificationQuery: verifyQuery,
      newItems: newItems.map((item) => ({
        id: item.id,
        product_id: item.content?.product_id,
        variant: item.content?.product_variant_id,
        email: item.content?.email,
        status: item.content?.status
      }))
    });
  } catch (error) {
    console.error('❌ Fixed migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
