// app/api/test-swell-direct/route.js - Test the exact Swell API structure
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

    console.log(`🔍 Direct Test API Request: ${method} ${url}`);
    console.log(`📝 Request payload:`, JSON.stringify(data, null, 2));

    const response = await fetch(url, options);
    const responseText = await response.text();

    console.log(`📋 Response status: ${response.status}`);
    console.log(`📋 Response text: "${responseText}"`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }

    if (!responseText.trim()) {
      return { success: true, empty: true, rawResponse: responseText };
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      return { success: false, parseError: true, text: responseText };
    }
  }
}

const swellAPI = new SwellBackendAPI();

// GET /api/test-swell-direct - Test different Swell API approaches
export async function GET(request) {
  try {
    console.log('🔍 Testing different Swell API approaches...');

    const tests = [];

    // Test 1: Try to get any wantlist items (different query formats)
    console.log('\n🧪 Test 1: Different query formats for GET');

    const getTests = [
      'limit=1',
      'limit=1&expand=true',
      'where[content.status]=active',
      'content.status=active',
      'filter[content.status]=active'
    ];

    for (const query of getTests) {
      try {
        const url = `/content/wantlist?${query}`;
        console.log(`📋 Testing GET: ${url}`);
        const result = await swellAPI.request('GET', url);
        tests.push({
          type: 'GET',
          query: query,
          success: true,
          result: result,
          hasResults: result.results && result.results.length > 0
        });
      } catch (error) {
        console.error(`❌ GET test failed for query "${query}":`, error.message);
        tests.push({
          type: 'GET',
          query: query,
          success: false,
          error: error.message
        });
      }
    }

    // Test 2: Try different POST structures
    console.log('\n🧪 Test 2: Different POST structures');

    const postTests = [
      {
        name: 'Flat structure',
        payload: {
          customer_id: '685cc1e3cc61440012943e02',
          product_id: 'test_direct_123',
          email: 'test@example.com',
          status: 'active'
        }
      },
      {
        name: 'Content wrapper',
        payload: {
          content: {
            customer_id: '685cc1e3cc61440012943e02',
            product_id: 'test_direct_456',
            email: 'test@example.com',
            status: 'active'
          }
        }
      },
      {
        name: 'Minimal required only',
        payload: {
          content: {
            customer_id: '685cc1e3cc61440012943e02',
            product_id: 'test_direct_789',
            email: 'test@example.com'
          }
        }
      }
    ];

    for (const test of postTests) {
      try {
        console.log(`📋 Testing POST: ${test.name}`);
        const result = await swellAPI.request('POST', '/content/wantlist', test.payload);
        tests.push({
          type: 'POST',
          name: test.name,
          success: true,
          result: result,
          created: result.id ? true : false
        });

        // Clean up if created
        if (result.id) {
          try {
            await swellAPI.request('DELETE', `/content/wantlist/${result.id}`);
            console.log(`🧹 Cleaned up test item: ${result.id}`);
          } catch (deleteError) {
            console.log(`⚠️ Could not clean up ${result.id}: ${deleteError.message}`);
          }
        }
      } catch (error) {
        console.error(`❌ POST test failed for "${test.name}":`, error.message);
        tests.push({
          type: 'POST',
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }

    // Test 3: Check content types/models
    console.log('\n🧪 Test 3: Check content models');
    try {
      const contentTypes = await swellAPI.request('GET', '/content');
      tests.push({
        type: 'CONTENT_TYPES',
        success: true,
        result: contentTypes
      });
    } catch (error) {
      tests.push({
        type: 'CONTENT_TYPES',
        success: false,
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Direct Swell API tests completed',
      tests: tests,
      summary: {
        totalTests: tests.length,
        successfulTests: tests.filter((t) => t.success).length,
        failedTests: tests.filter((t) => !t.success).length
      }
    });
  } catch (error) {
    console.error('❌ Direct test error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
