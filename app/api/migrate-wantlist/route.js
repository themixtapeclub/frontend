// app/api/migrate-wantlist/route.js - Migration script to move data from customer metadata to content model
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

    console.log(`🔍 Migration API Request: ${method} ${url}`);

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `❌ Migration API ${method} ${endpoint} failed:`,
            response.status,
            errorText
          );

          if (response.status >= 500 && attempt < retries) {
            console.log(`🔄 Retrying request (attempt ${attempt + 1}/${retries + 1})...`);
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          throw new Error(`Migration API request failed: ${response.status} ${errorText}`);
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
          `❌ Migration API ${method} ${endpoint} attempt ${attempt + 1} failed:`,
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

// POST /api/migrate-wantlist - Migrate wantlist data from customer metadata to content model
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    console.log('🚀 Starting wantlist migration for customer:', customerId);

    // Get customer account with existing wantlist data
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    if (!customer || customer.empty) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Get existing wantlist from metadata or content
    const existingWantlist = customer.metadata?.wantlist || customer.content?.wantlist || [];

    console.log(`📋 Found ${existingWantlist.length} items in customer metadata`);

    if (existingWantlist.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items to migrate',
        migrated: 0,
        skipped: 0
      });
    }

    // Filter only active items
    const activeItems = existingWantlist.filter((item) => item.status === 'active');
    console.log(`📋 Found ${activeItems.length} active items to migrate`);

    let migrated = 0;
    let skipped = 0;
    const errors = [];

    // Migrate each active item to content model
    for (const item of activeItems) {
      try {
        console.log(`🔄 Migrating item: ${item.product_id}`);

        // Check if item already exists in content model - using content.field syntax
        let query = `content.status=active&content.product_id=${encodeURIComponent(
          item.product_id
        )}&content.customer_id=${encodeURIComponent(customerId)}`;
        if (item.product_variant_id) {
          query += `&content.product_variant_id=${encodeURIComponent(item.product_variant_id)}`;
        }

        const existingContentItems = await swellAPI.request('GET', `/content/wantlist?${query}`);

        if (existingContentItems.results && existingContentItems.results.length > 0) {
          console.log(`⚠️ Item ${item.product_id} already exists in content model, skipping`);
          skipped++;
          continue;
        }

        // Create new content model item with proper nested structure
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

        const createdItem = await swellAPI.request('POST', '/content/wantlist', contentItem);

        if (createdItem && createdItem.id) {
          console.log(`✅ Migrated item ${item.product_id} to content model: ${createdItem.id}`);
          migrated++;
        } else {
          console.error(`❌ Failed to create content item for ${item.product_id}`);
          errors.push(`Failed to create content item for ${item.product_id}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating item ${item.product_id}:`, error.message);
        errors.push(`Error migrating ${item.product_id}: ${error.message}`);
      }
    }

    console.log(
      `🏁 Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors.length} errors`
    );

    return NextResponse.json({
      success: true,
      migrated,
      skipped,
      errors,
      message: `Migration complete: ${migrated} items migrated, ${skipped} items skipped`
    });
  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET /api/migrate-wantlist - Check migration status for a customer
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    console.log('🔍 Checking migration status for customer:', customerId);

    // Get customer account
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);
    if (!customer || customer.empty) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Count items in old system
    const oldWantlist = customer.metadata?.wantlist || customer.content?.wantlist || [];
    const oldActiveItems = oldWantlist.filter((item) => item.status === 'active');

    // Count items in new system - using content.field syntax
    const query = `content.status=active&content.customer_id=${encodeURIComponent(customerId)}`;
    const contentItems = await swellAPI.request('GET', `/content/wantlist?${query}&limit=100`);
    const newItems = contentItems.results || [];

    return NextResponse.json({
      success: true,
      customer: {
        id: customerId,
        email: customer.email
      },
      oldSystem: {
        totalItems: oldWantlist.length,
        activeItems: oldActiveItems.length
      },
      newSystem: {
        activeItems: newItems.length
      },
      needsMigration: oldActiveItems.length > 0 && newItems.length === 0
    });
  } catch (error) {
    console.error('❌ Migration status check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
