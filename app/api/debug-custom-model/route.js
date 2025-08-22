// app/api/debug-custom-model/route.js - Debug the custom model API
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
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    console.log(`🔍 Debug API Request: ${method} ${url}`);
    if (data) console.log('📤 Request data:', JSON.stringify(data, null, 2));

    const response = await fetch(url, options);
    const responseText = await response.text();

    console.log(`📥 Response status: ${response.status}`);
    console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`📥 Response text:`, responseText);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }

    if (!responseText.trim()) {
      return { empty: true, status: response.status };
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return { parseError: true, text: responseText };
    }
  }
}

export async function GET() {
  try {
    const swellAPI = new SwellBackendAPI();

    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: List all content models
    try {
      console.log('\n🧪 TEST 1: List content models');
      const modelsResult = await swellAPI.request('GET', '/content');
      results.tests.push({
        name: 'List content models',
        success: true,
        result: modelsResult
      });
    } catch (error) {
      results.tests.push({
        name: 'List content models',
        success: false,
        error: error.message
      });
    }

    // Test 2: Check if wantlist model exists
    try {
      console.log('\n🧪 TEST 2: Check wantlist model');
      const wantlistModelResult = await swellAPI.request('GET', '/content/wantlist');
      results.tests.push({
        name: 'Check wantlist model',
        success: true,
        result: wantlistModelResult
      });
    } catch (error) {
      results.tests.push({
        name: 'Check wantlist model',
        success: false,
        error: error.message
      });
    }

    // Test 3: Try to create a simple wantlist item
    try {
      console.log('\n🧪 TEST 3: Create simple wantlist item');
      const createResult = await swellAPI.request('POST', '/content/wantlist', {
        customer_id: 'test_customer_debug',
        product_id: 'test_product_debug',
        email: 'debug@test.com',
        status: 'active',
        notify_when_available: true,
        date_added: new Date().toISOString()
      });
      results.tests.push({
        name: 'Create simple wantlist item',
        success: true,
        result: createResult
      });
    } catch (error) {
      results.tests.push({
        name: 'Create simple wantlist item',
        success: false,
        error: error.message
      });
    }

    // Test 4: Try different endpoint formats
    const endpointTests = [
      '/content/wantlist',
      `/content/${process.env.NEXT_PUBLIC_SWELL_STORE_ID}.com.wantlist`,
      '/models/wantlist',
      '/models/wantlist/records'
    ];

    for (const endpoint of endpointTests) {
      try {
        console.log(`\n🧪 TEST: Try endpoint ${endpoint}`);
        const result = await swellAPI.request('GET', endpoint);
        results.tests.push({
          name: `Try endpoint ${endpoint}`,
          success: true,
          result: result
        });
      } catch (error) {
        results.tests.push({
          name: `Try endpoint ${endpoint}`,
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      debug: results
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
