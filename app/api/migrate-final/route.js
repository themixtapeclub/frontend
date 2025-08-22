// app/api/migrate-final/route.js - Final migration with only valid content model fields
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

    console.log(`🔍 Final Migration API Request: ${method} ${url}`);
    console.log(`📝 Request payload:`, JSON.stringify(data, null, 2));

    const response = await fetch(url, options);
    const responseText = await response.text();

    console.log(`📋 Response status: ${response.status}`);
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`📋 Response text: "${responseText}"`);

    if (!response.ok) {
      console.error(
        `❌ Final Migration API ${method} ${endpoint} failed:`,
        response.status,
        responseText
      );
      throw new Error(`Final Migration API request failed: ${response.status} ${responseText}`);
    }

    if (!responseText.trim()) {
      console.log('⚠️ Empty response - this might indicate a validation issue');
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

// GET /api/migrate-final - Final migration with only content model fields
export async function GET(request) {
  try {
    const customerId = '685cc1e3cc61440012943e02';
    console.log('🚀 Starting FINAL migration for customer:', customerId);

    // Step 1: Get customer account
    console.log('📋 Step 1: Getting customer account...');
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    if (!customer || customer.empty) {
      return NextResponse.json({ success: false, error: 'Customer not found' });
    }

    // Step 2: Get existing wantlist data
    const existingWantlist = customer.content?.wantlist || [];
    const activeItems = existingWantlist.filter((item) => item.status === 'active');

    console.log('📋 Found', activeItems.length, 'active items to migrate');

    if (activeItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active items to migrate'
      });
    }

    // Step 3: Migrate with ONLY valid content model fields
    console.log('📋 Starting migration with ONLY valid content model fields...');
    let migrated = 0;
    const errors = [];

    for (const item of activeItems) {
      try {
        console.log(`🔄 Migrating: ${item.product_id}`);

        // ONLY include fields that exist in your content model
        const contentItem = {
          content: {
            customer_id: customerId,
            product_id: item.product_id,
            email: customer.email,
            notify_when_available: item.notify_when_available || true,
            status: 'active'
            // NOTE: Removed product_variant_id since it's not in your content model
          }
        };

        console.log(
          '📝 Creating content item with ONLY valid fields:',
          JSON.stringify(contentItem, null, 2)
        );

        const createdItem = await swellAPI.request('POST', '/content/wantlist', contentItem);

        if (createdItem && createdItem.id) {
          console.log(`✅ Successfully migrated ${item.product_id} -> ${createdItem.id}`);
          console.log('✅ Created item details:', JSON.stringify(createdItem, null, 2));
          migrated++;
        } else if (createdItem.empty) {
          console.log('⚠️ Empty response - trying minimal payload...');

          // Try with even more minimal payload
          const minimalItem = {
            content: {
              customer_id: customerId,
              product_id: item.product_id,
              email: customer.email
            }
          };

          console.log('📝 Trying minimal payload:', JSON.stringify(minimalItem, null, 2));
          const minimalResult = await swellAPI.request('POST', '/content/wantlist', minimalItem);

          if (minimalResult && minimalResult.id) {
            console.log(
              `✅ Successfully migrated with minimal payload ${item.product_id} -> ${minimalResult.id}`
            );
            migrated++;
          } else {
            console.error(`❌ Even minimal payload failed for ${item.product_id}:`, minimalResult);
            errors.push(
              `Failed to create content item for ${item.product_id}: Empty response even with minimal payload`
            );
          }
        } else {
          console.error(`❌ Failed to create content item for ${item.product_id}:`, createdItem);
          errors.push(
            `Failed to create content item for ${item.product_id}: ${JSON.stringify(createdItem)}`
          );
        }
      } catch (error) {
        console.error(`❌ Error migrating ${item.product_id}:`, error.message);
        errors.push(`Error migrating ${item.product_id}: ${error.message}`);
      }
    }

    // Step 4: Verify migration
    console.log('📋 Verifying migration...');
    const verifyQuery = `content.status=active&content.customer_id=${encodeURIComponent(
      customerId
    )}`;
    const verifyResult = await swellAPI.request(
      'GET',
      `/content/wantlist?${verifyQuery}&limit=100`
    );
    const newItems = verifyResult.results || [];

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
      newItems: newItems
    });
  } catch (error) {
    console.error('❌ Final migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
