// app/api/simple-migrate/route.js - Direct migration for debugging
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

    console.log(`🔍 Simple Migration API Request: ${method} ${url}`);
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `❌ Simple Migration API ${method} ${endpoint} failed:`,
        response.status,
        errorText
      );
      throw new Error(`Simple Migration API request failed: ${response.status} ${errorText}`);
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
  }
}

const swellAPI = new SwellBackendAPI();

// GET /api/simple-migrate - Direct migration for customer 685cc1e3cc61440012943e02
export async function GET(request) {
  try {
    const customerId = '685cc1e3cc61440012943e02';
    console.log('🚀 Starting DIRECT migration for customer:', customerId);

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

    // Step 2: Check for existing wantlist data
    console.log('📋 Step 2: Checking for existing wantlist data...');
    const metadataWantlist = customer.metadata?.wantlist || [];
    const contentWantlist = customer.content?.wantlist || [];

    console.log('📋 Metadata wantlist:', metadataWantlist.length, 'items');
    console.log('📋 Content wantlist:', contentWantlist.length, 'items');

    const existingWantlist = metadataWantlist.length > 0 ? metadataWantlist : contentWantlist;

    if (existingWantlist.length > 0) {
      console.log('📋 Found wantlist data:');
      existingWantlist.forEach((item, index) => {
        console.log(
          `  ${index}: product=${item.product_id}, variant=${item.product_variant_id}, status=${item.status}, email=${item.email}`
        );
      });
    }

    // Step 3: Filter active items
    const activeItems = existingWantlist.filter((item) => item.status === 'active');
    console.log('📋 Step 3: Found', activeItems.length, 'active items to migrate');

    if (activeItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active items to migrate',
        customer: { id: customer.id, email: customer.email },
        existingData: { metadata: metadataWantlist.length, content: contentWantlist.length }
      });
    }

    // Step 4: Migrate each item
    console.log('📋 Step 4: Starting migration...');
    let migrated = 0;
    const errors = [];

    for (const item of activeItems) {
      try {
        console.log(`🔄 Migrating: ${item.product_id}`);

        const contentItem = {
          customer_id: customerId,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id || null,
          email: customer.email,
          notify_when_available: item.notify_when_available || true,
          status: 'active'
        };

        console.log('📝 Creating content item:', contentItem);

        const createdItem = await swellAPI.request('POST', '/content/wantlist', contentItem);

        if (createdItem && createdItem.id) {
          console.log(`✅ Successfully migrated ${item.product_id} -> ${createdItem.id}`);
          migrated++;
        } else {
          console.error(`❌ Failed to create content item for ${item.product_id}:`, createdItem);
          errors.push(`Failed to create content item for ${item.product_id}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating ${item.product_id}:`, error.message);
        errors.push(`Error migrating ${item.product_id}: ${error.message}`);
      }
    }

    // Step 5: Verify migration
    console.log('📋 Step 5: Verifying migration...');
    const verifyQuery = `status=active&customer_id=${encodeURIComponent(customerId)}`;
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
      originalData: existingWantlist.map((item) => ({
        product_id: item.product_id,
        variant: item.product_variant_id,
        status: item.status,
        email: item.email
      })),
      newItems: newItems.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        variant: item.product_variant_id,
        email: item.email
      }))
    });
  } catch (error) {
    console.error('❌ Direct migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
