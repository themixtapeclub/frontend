// ===== FIXED: app/api/test-content-model/route.js =====
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

    console.log(`🔍 Test API Request: ${method} ${url}`);
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Test API ${method} ${endpoint} failed:`, response.status, errorText);
      throw new Error(`Test API request failed: ${response.status} ${errorText}`);
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

// ✅ FIXED: Use nextUrl instead of request.url
export async function GET(request) {
  try {
    console.log('🧪 Testing content model access...');

    // Test 1: Try to get content models list
    console.log('🔍 Test 1: Getting content models...');
    try {
      const contentModels = await swellAPI.request('GET', '/content');
      console.log('✅ Content models response:', Object.keys(contentModels));
    } catch (error) {
      console.error('❌ Failed to get content models:', error.message);
    }

    // Test 2: Try to access wantlist content
    console.log('🔍 Test 2: Testing wantlist content access...');
    try {
      const wantlistContent = await swellAPI.request('GET', '/content/wantlist?limit=1');
      console.log('✅ Wantlist content access successful:', wantlistContent);
    } catch (error) {
      console.error('❌ Failed to access wantlist content:', error.message);

      // Test 3: Try to create a test wantlist item
      console.log('🔍 Test 3: Trying to create a test wantlist item...');
      try {
        const testItem = {
          customer_id: 'test_customer',
          product_id: 'test_product',
          email: 'test@example.com',
          status: 'test'
        };

        const createdItem = await swellAPI.request('POST', '/content/wantlist', testItem);
        console.log('✅ Test item creation successful:', createdItem);

        // Clean up test item
        if (createdItem.id) {
          await swellAPI.request('DELETE', `/content/wantlist/${createdItem.id}`);
          console.log('🧹 Cleaned up test item');
        }
      } catch (createError) {
        console.error('❌ Failed to create test item:', createError.message);
      }
    }

    // Test 4: Check specific customer
    // ✅ FIXED: Use request.nextUrl instead of new URL(request.url)
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (customerId) {
      console.log('🔍 Test 4: Checking specific customer:', customerId);
      try {
        const customer = await swellAPI.request('GET', `/accounts/${customerId}`);
        console.log('✅ Customer found:', {
          id: customer.id,
          email: customer.email,
          hasMetadata: !!customer.metadata,
          hasContent: !!customer.content,
          metadataKeys: customer.metadata ? Object.keys(customer.metadata) : [],
          contentKeys: customer.content ? Object.keys(customer.content) : []
        });

        if (customer.metadata?.wantlist || customer.content?.wantlist) {
          const wantlist = customer.metadata?.wantlist || customer.content?.wantlist;
          console.log('📋 Found wantlist in customer:', {
            location: customer.metadata?.wantlist ? 'metadata' : 'content',
            totalItems: wantlist.length,
            activeItems: wantlist.filter((item) => item.status === 'active').length
          });
        }
      } catch (error) {
        console.error('❌ Failed to get customer:', error.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Content model test completed - check server logs for details'
    });
  } catch (error) {
    console.error('❌ Content model test error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
