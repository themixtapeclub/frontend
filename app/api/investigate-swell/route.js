// app/api/investigate-swell/route.js - Investigate what's wrong with Swell API
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

    console.log(`🔍 Investigation API Request: ${method} ${url}`);
    if (data) console.log(`📝 Request payload:`, JSON.stringify(data, null, 2));

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

// GET /api/investigate-swell - Investigate Swell API issues
export async function GET(request) {
  try {
    console.log('🔍 Starting Swell API investigation...');

    const results = [];

    // Test 1: Check basic connectivity
    console.log('\n🧪 Test 1: Basic connectivity - Get store info');
    try {
      const storeInfo = await swellAPI.request('GET', '');
      results.push({
        test: 'Basic connectivity',
        success: true,
        result: storeInfo
      });
    } catch (error) {
      results.push({
        test: 'Basic connectivity',
        success: false,
        error: error.message
      });
    }

    // Test 2: Check content models list
    console.log('\n🧪 Test 2: List all content models');
    try {
      const contentModels = await swellAPI.request('GET', '/content');
      results.push({
        test: 'Content models list',
        success: true,
        result: contentModels,
        hasWantlist: contentModels.results?.some(
          (model) => model.name === 'wantlist' || model.id === 'wantlist'
        )
      });
    } catch (error) {
      results.push({
        test: 'Content models list',
        success: false,
        error: error.message
      });
    }

    // Test 3: Check data models
    console.log('\n🧪 Test 3: Check data models');
    try {
      const dataModels = await swellAPI.request('GET', '/:models');
      results.push({
        test: 'Data models list',
        success: true,
        result: dataModels,
        hasWantlist: dataModels.results?.some(
          (model) => model.name === 'wantlist' || model.id === 'wantlist'
        )
      });
    } catch (error) {
      results.push({
        test: 'Data models list',
        success: false,
        error: error.message
      });
    }

    // Test 4: Try different wantlist endpoints
    console.log('\n🧪 Test 4: Try different wantlist endpoints');
    const endpoints = ['/content/wantlist', '/wantlist', '/:models/wantlist', '/content/wantlists'];

    for (const endpoint of endpoints) {
      try {
        const result = await swellAPI.request('GET', `${endpoint}?limit=1`);
        results.push({
          test: `Endpoint: ${endpoint}`,
          success: true,
          result: result
        });
      } catch (error) {
        results.push({
          test: `Endpoint: ${endpoint}`,
          success: false,
          error: error.message
        });
      }
    }

    // Test 5: Check if we can create a simple test item
    console.log('\n🧪 Test 5: Try to create a test item');
    try {
      const testPayload = {
        content: {
          customer_id: 'test_123',
          product_id: 'test_product',
          email: 'test@example.com',
          status: 'test'
        }
      };

      const createResult = await swellAPI.request('POST', '/content/wantlist', testPayload);

      results.push({
        test: 'Create test item',
        success: true,
        result: createResult
      });

      // Try to clean up
      if (createResult.id) {
        try {
          await swellAPI.request('DELETE', `/content/wantlist/${createResult.id}`);
          console.log('🧹 Test item cleaned up');
        } catch (deleteError) {
          console.log('⚠️ Could not clean up test item');
        }
      }
    } catch (error) {
      results.push({
        test: 'Create test item',
        success: false,
        error: error.message
      });
    }

    // Test 6: Check our specific customer
    console.log('\n🧪 Test 6: Check our specific customer');
    try {
      const customer = await swellAPI.request('GET', '/accounts/685cc1e3cc61440012943e02');
      const wantlistData = customer.content?.wantlist || [];
      const activeItems = wantlistData.filter((item) => item.status === 'active');

      results.push({
        test: 'Customer data',
        success: true,
        result: {
          customerId: customer.id,
          email: customer.email,
          wantlistItems: wantlistData.length,
          activeItems: activeItems.length,
          hasContentWantlist: !!customer.content?.wantlist,
          hasMetadataWantlist: !!customer.metadata?.wantlist
        }
      });
    } catch (error) {
      results.push({
        test: 'Customer data',
        success: false,
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Swell API investigation completed',
      environment: {
        storeId: process.env.NEXT_PUBLIC_SWELL_STORE_ID,
        hasSecretKey: !!process.env.SWELL_SECRET_KEY
      },
      results: results,
      summary: {
        totalTests: results.length,
        successfulTests: results.filter((r) => r.success).length,
        failedTests: results.filter((r) => !r.success).length
      }
    });
  } catch (error) {
    console.error('❌ Investigation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
