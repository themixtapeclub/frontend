// ===== FIXED: app/api/wantlist/check/route.js =====
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const backendAPI = {
  async request(method, endpoint, data) {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    const secretKey = process.env.SWELL_SECRET_KEY;

    if (!storeId || !secretKey) {
      throw new Error('Missing Swell credentials');
    }

    const url = `https://${storeId}.swell.store/api${endpoint}`;
    const options = {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${storeId}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  },

  async get(endpoint) {
    return this.request('GET', endpoint);
  }
};

// ✅ FIXED: Use request.nextUrl instead of new URL(request.url)
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId');

    if (!customerId || !productId) {
      return NextResponse.json({ error: 'customerId and productId are required' }, { status: 400 });
    }

    console.log('🔍 Checking guest wantlist:', { customerId, productId, variantId });

    // Query the wantlist content model
    const result = await backendAPI.get(
      `/content/wantlist?where[customer_id]=${customerId}&where[product_id]=${productId}&where[product_variant_id]=${
        variantId || 'null'
      }&where[status]=active`
    );

    const inWantlist = result.results && result.results.length > 0;

    console.log('🔍 Guest wantlist check result:', inWantlist);

    return NextResponse.json({ success: true, inWantlist });
  } catch (error) {
    console.error('GET /api/wantlist/check error:', error);
    return NextResponse.json(
      { success: false, error: error.message, inWantlist: false },
      { status: 500 }
    );
  }
}
