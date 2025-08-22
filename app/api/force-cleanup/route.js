// app/api/force-cleanup/route.js - Aggressively remove old wantlist data
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

    console.log(`🔍 Force Cleanup API Request: ${method} ${url}`);
    if (data) console.log(`📝 Request data:`, JSON.stringify(data, null, 2));

    const response = await fetch(url, options);
    const responseText = await response.text();

    console.log(`📊 Response status: ${response.status}`);
    console.log(`📄 Response text: "${responseText}"`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }

    if (!responseText.trim()) {
      return { success: true, empty: true };
    }

    return JSON.parse(responseText);
  }
}

const swellAPI = new SwellBackendAPI();

export async function POST(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId') || '685cc1e3cc61440012943e02';

    console.log('🚨 FORCE CLEANUP: Aggressively removing wantlist data for:', customerId);

    // Get current customer data
    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    console.log('📋 Current customer content:', customer.content);

    // Try multiple approaches to remove the wantlist data
    const approaches = [];

    // Approach 1: Set content to empty object
    try {
      console.log('🧪 Approach 1: Setting content to empty object');
      await swellAPI.request('PUT', `/accounts/${customerId}`, {
        content: {}
      });
      approaches.push({ approach: 1, success: true, method: 'Empty content object' });
    } catch (error) {
      approaches.push({ approach: 1, success: false, error: error.message });
    }

    // Approach 2: Set content to null
    try {
      console.log('🧪 Approach 2: Setting content to null');
      await swellAPI.request('PUT', `/accounts/${customerId}`, {
        content: null
      });
      approaches.push({ approach: 2, success: true, method: 'Null content' });
    } catch (error) {
      approaches.push({ approach: 2, success: false, error: error.message });
    }

    // Approach 3: Keep other content but remove wantlist specifically
    try {
      console.log('🧪 Approach 3: Remove only wantlist property');
      const cleanContent = { ...customer.content };
      delete cleanContent.wantlist;

      await swellAPI.request('PUT', `/accounts/${customerId}`, {
        content: cleanContent
      });
      approaches.push({ approach: 3, success: true, method: 'Delete wantlist property only' });
    } catch (error) {
      approaches.push({ approach: 3, success: false, error: error.message });
    }

    // Approach 4: Use PATCH instead of PUT
    try {
      console.log('🧪 Approach 4: Using PATCH method');
      await swellAPI.request('PATCH', `/accounts/${customerId}`, {
        content: {}
      });
      approaches.push({ approach: 4, success: true, method: 'PATCH with empty content' });
    } catch (error) {
      approaches.push({ approach: 4, success: false, error: error.message });
    }

    // Check if any approach worked
    const updatedCustomer = await swellAPI.request('GET', `/accounts/${customerId}`);

    return NextResponse.json({
      success: true,
      message: 'Force cleanup completed',
      customerId: customerId,
      approaches: approaches,
      before: {
        hasWantlist: !!customer.content?.wantlist,
        wantlistCount: customer.content?.wantlist?.length || 0
      },
      after: {
        hasWantlist: !!updatedCustomer.content?.wantlist,
        wantlistCount: updatedCustomer.content?.wantlist?.length || 0,
        contentKeys: Object.keys(updatedCustomer.content || {})
      },
      success_cleanup: !updatedCustomer.content?.wantlist
    });
  } catch (error) {
    console.error('❌ Force cleanup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
