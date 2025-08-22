// app/api/debug-swell-auth/route.js - Test different authentication methods
import { NextResponse } from 'next/server';

async function testSwellAuth(method, storeId, key, keyType) {
  console.log(`🧪 Testing ${keyType} with ${method} method`);

  try {
    const url = `https://${storeId}.swell.store/api/accounts/685cc1e3cc61440012943e02`;

    let headers = {
      'Content-Type': 'application/json'
    };

    // Try different authentication methods
    switch (method) {
      case 'basic_auth':
        headers.Authorization = `Basic ${Buffer.from(`${storeId}:${key}`).toString('base64')}`;
        break;
      case 'bearer':
        headers.Authorization = `Bearer ${key}`;
        break;
      case 'api_key_header':
        headers['X-API-Key'] = key;
        break;
      case 'swell_auth':
        headers['Authorization'] = key;
        break;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    const result = {
      method,
      keyType,
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    };

    if (response.ok) {
      const data = await response.json();
      result.data = { id: data.id, email: data.email };
    } else {
      const errorText = await response.text();
      result.error = errorText;
    }

    return result;
  } catch (error) {
    return {
      method,
      keyType,
      error: error.message
    };
  }
}

export async function GET() {
  try {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    const publicKey = process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY;
    const secretKey = process.env.SWELL_SECRET_KEY;

    console.log('🧪 Testing Swell authentication methods...');

    const results = [];

    // Test different authentication methods with both keys
    const methods = ['basic_auth', 'bearer', 'api_key_header', 'swell_auth'];

    for (const method of methods) {
      if (publicKey) {
        const publicResult = await testSwellAuth(method, storeId, publicKey, 'public');
        results.push(publicResult);
      }

      if (secretKey) {
        const secretResult = await testSwellAuth(method, storeId, secretKey, 'secret');
        results.push(secretResult);
      }
    }

    // Also test the swell-node package format
    if (secretKey) {
      console.log('🧪 Testing swell-node format...');

      try {
        const url = `https://${storeId}.swell.store/api/accounts/685cc1e3cc61440012943e02`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Basic ${Buffer.from(`${storeId}:${secretKey}`).toString('base64')}`,
            'Content-Type': 'application/json',
            'User-Agent': 'swell-node/1.0.0'
          }
        });

        results.push({
          method: 'swell_node_format',
          keyType: 'secret',
          status: response.status,
          ok: response.ok,
          error: response.ok ? null : await response.text()
        });
      } catch (error) {
        results.push({
          method: 'swell_node_format',
          keyType: 'secret',
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      storeId: storeId ? `${storeId.substring(0, 8)}...` : 'missing',
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      results,
      workingMethods: results.filter((r) => r.ok)
    });
  } catch (error) {
    console.error('Debug auth endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
