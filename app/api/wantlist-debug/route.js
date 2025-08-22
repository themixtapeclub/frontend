// app/api/wantlist-debug/route.js - Debug version to find the real issue
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

    console.log(`🔍 DEBUG API Request: ${method} ${url}`);
    if (data) console.log(`📝 Request data:`, JSON.stringify(data, null, 2));

    const response = await fetch(url, options);
    const responseText = await response.text();

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📄 Response text:`, responseText);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }

    if (!responseText.trim()) {
      return { success: true, empty: true, rawResponse: responseText };
    }

    try {
      const parsed = JSON.parse(responseText);
      console.log(`✅ Parsed response:`, JSON.stringify(parsed, null, 2));
      return parsed;
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return { success: false, parseError: true, text: responseText };
    }
  }
}

const swellAPI = new SwellBackendAPI();

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get('action') || 'investigate';
    const customerId = searchParams.get('customerId') || '685cc1e3cc61440012943e02';

    console.log(`🔍 DEBUG ACTION: ${action} for customer: ${customerId}`);

    const results = {};

    if (action === 'investigate' || action === 'all') {
      // 1. Check if customer exists and get details
      console.log('\n📝 Step 1: Get customer details');
      try {
        const customer = await swellAPI.request('GET', `/accounts/${customerId}`);
        results.customer = {
          id: customer.id,
          email: customer.email,
          hasContentWantlist: !!customer.content?.wantlist,
          contentWantlistCount: customer.content?.wantlist?.length || 0,
          contentWantlistItems: customer.content?.wantlist || []
        };
      } catch (error) {
        results.customer = { error: error.message };
      }

      // 2. Try different query formats for content model
      console.log('\n📝 Step 2: Try different content model queries');
      const queries = [
        // Query with individual parameters
        `content.customer_id=${customerId}`,

        // Query with status filter
        `content.customer_id=${customerId}&content.status=active`,

        // Query with email
        `content.customer_id=${customerId}&content.email=notmargarine@gmail.com`,

        // Query with just email
        `content.email=notmargarine@gmail.com`,

        // No filters - get all
        `limit=10`,

        // Try with where parameter
        `where=${encodeURIComponent(JSON.stringify({ 'content.customer_id': customerId }))}`,

        // Try customer_id without content prefix
        `customer_id=${customerId}`
      ];

      results.contentQueries = [];

      for (const query of queries) {
        console.log(`\n🔍 Trying query: ${query}`);
        try {
          const result = await swellAPI.request('GET', `/content/wantlist?${query}`);
          results.contentQueries.push({
            query: query,
            success: true,
            count: result.results?.length || 0,
            totalCount: result.count || 0,
            items: result.results || [],
            rawResult: result
          });
        } catch (error) {
          results.contentQueries.push({
            query: query,
            success: false,
            error: error.message
          });
        }
      }

      // 3. Try the data model endpoint
      console.log('\n📝 Step 3: Try data model endpoint');
      try {
        const dataResult = await swellAPI.request('GET', `/wantlist?limit=10`);
        results.dataModel = {
          success: true,
          count: dataResult.results?.length || 0,
          totalCount: dataResult.count || 0,
          items: dataResult.results || []
        };
      } catch (error) {
        results.dataModel = { success: false, error: error.message };
      }

      // 4. Check content model structure
      console.log('\n📝 Step 4: Check content model structure');
      try {
        const modelInfo = await swellAPI.request('GET', '/:models/content/wantlist');
        results.modelStructure = modelInfo;
      } catch (error) {
        results.modelStructure = { error: error.message };
      }
    }

    if (action === 'create-test' || action === 'all') {
      // 5. Create a test item with full logging
      console.log('\n📝 Step 5: Create test item');
      try {
        const testData = {
          content: {
            customer_id: customerId,
            product_id: 'test_product_debug',
            email: 'notmargarine@gmail.com',
            status: 'active',
            notify_when_available: true,
            date_added: new Date().toISOString()
          }
        };

        const createResult = await swellAPI.request('POST', '/content/wantlist', testData);
        results.testCreate = {
          success: true,
          result: createResult,
          createdId: createResult?.id
        };

        // Immediately try to find the created item
        if (createResult?.id) {
          console.log(`\n🔍 Looking for newly created item: ${createResult.id}`);
          try {
            const findResult = await swellAPI.request(
              'GET',
              `/content/wantlist/${createResult.id}`
            );
            results.testFind = {
              success: true,
              found: !!findResult,
              item: findResult
            };
          } catch (findError) {
            results.testFind = {
              success: false,
              error: findError.message
            };
          }

          // Try to delete the test item
          try {
            await swellAPI.request('DELETE', `/content/wantlist/${createResult.id}`);
            results.testCleanup = { success: true };
          } catch (deleteError) {
            results.testCleanup = { success: false, error: deleteError.message };
          }
        }
      } catch (error) {
        results.testCreate = { success: false, error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Debug investigation completed',
      customerId: customerId,
      action: action,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST endpoint to test creation with different approaches
export async function POST(request) {
  try {
    const body = await request.json();
    const { customerId = '685cc1e3cc61440012943e02', productId = 'test_product' } = body;

    console.log('🧪 Testing different creation approaches...');

    const results = [];

    // Approach 1: Content model with full structure
    console.log('\n📝 Approach 1: Content model with full structure');
    try {
      const result1 = await swellAPI.request('POST', '/content/wantlist', {
        content: {
          customer_id: customerId,
          product_id: productId + '_1',
          email: 'notmargarine@gmail.com',
          status: 'active',
          notify_when_available: true,
          date_added: new Date().toISOString()
        }
      });
      results.push({
        approach: 'Content model with full structure',
        success: true,
        result: result1,
        id: result1?.id
      });
    } catch (error) {
      results.push({
        approach: 'Content model with full structure',
        success: false,
        error: error.message
      });
    }

    // Approach 2: Data model
    console.log('\n📝 Approach 2: Data model');
    try {
      const result2 = await swellAPI.request('POST', '/wantlist', {
        content: {
          customer_id: customerId,
          product_id: productId + '_2',
          email: 'notmargarine@gmail.com',
          status: 'active',
          notify_when_available: true,
          date_added: new Date().toISOString()
        }
      });
      results.push({
        approach: 'Data model',
        success: true,
        result: result2,
        id: result2?.id
      });
    } catch (error) {
      results.push({
        approach: 'Data model',
        success: false,
        error: error.message
      });
    }

    // Approach 3: Content model with minimal data
    console.log('\n📝 Approach 3: Content model with minimal data');
    try {
      const result3 = await swellAPI.request('POST', '/content/wantlist', {
        customer_id: customerId,
        product_id: productId + '_3',
        email: 'notmargarine@gmail.com',
        status: 'active'
      });
      results.push({
        approach: 'Content model with minimal data',
        success: true,
        result: result3,
        id: result3?.id
      });
    } catch (error) {
      results.push({
        approach: 'Content model with minimal data',
        success: false,
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Creation tests completed',
      results: results
    });
  } catch (error) {
    console.error('❌ Test creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
