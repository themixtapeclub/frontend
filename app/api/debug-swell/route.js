// app/api/debug-swell/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    const secretKey = process.env.SWELL_SECRET_KEY;

    console.log('🔍 Environment check:');
    console.log('Store ID:', storeId);
    console.log('Has Secret Key:', !!secretKey);
    console.log('Secret Key length:', secretKey ? secretKey.length : 0);

    if (!storeId || !secretKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing credentials',
        details: {
          hasStoreId: !!storeId,
          hasSecretKey: !!secretKey,
          storeId: storeId || 'missing'
        }
      });
    }

    // Test 1: Basic products API (should work with secret key)
    console.log('🧪 Test 1: Products API with secret key...');
    const productsUrl = `https://${storeId}.swell.store/api/products?limit=1`;
    const productsResponse = await fetch(productsUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${storeId}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Products API status:', productsResponse.status);

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error('Products API error:', errorText);

      // Test 2: Try with public key to see if secret key is wrong
      console.log('🧪 Test 2: Trying with public key...');
      const publicKey = process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY;

      if (publicKey) {
        const publicTestResponse = await fetch(productsUrl, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${storeId}:${publicKey}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Public key test status:', publicTestResponse.status);

        return NextResponse.json({
          success: false,
          error: 'Secret key authentication failed',
          details: {
            secretKeyStatus: productsResponse.status,
            publicKeyStatus: publicTestResponse.status,
            secretKeyError: errorText,
            suggestion: publicTestResponse.ok ? 'Secret key might be incorrect' : 'Both keys failed'
          }
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Secret key authentication failed',
        details: {
          status: productsResponse.status,
          error: errorText
        }
      });
    }

    const productsData = await productsResponse.json();
    console.log('✅ Products API success');

    // Test 3: Content API
    console.log('🧪 Test 3: Content API...');
    const contentUrl = `https://${storeId}.swell.store/api/content/wantlist?limit=1`;
    const contentResponse = await fetch(contentUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${storeId}:${secretKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Content API status:', contentResponse.status);

    if (!contentResponse.ok) {
      const contentError = await contentResponse.text();
      console.error('Content API error:', contentError);

      return NextResponse.json({
        success: false,
        error: 'Content API failed',
        details: {
          productsWorking: true,
          contentStatus: contentResponse.status,
          contentError: contentError,
          suggestion: 'Products work but content fails - might be a permissions issue'
        }
      });
    }

    const contentData = await contentResponse.json();
    console.log('✅ Content API success');

    return NextResponse.json({
      success: true,
      message: 'All APIs working correctly',
      details: {
        storeId,
        productsCount: productsData.count || 0,
        contentResults: contentData.results ? contentData.results.length : 0,
        secretKeyWorking: true
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        errorType: error.constructor.name
      }
    });
  }
}
