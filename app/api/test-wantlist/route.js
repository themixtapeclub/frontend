// app/api/test-wantlist/route.js - Test if environment is set up correctly
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    const publicKey = process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY;
    const secretKey = process.env.SWELL_SECRET_KEY;

    console.log('🔍 Environment check:', {
      hasStoreId: !!storeId,
      hasPublicKey: !!publicKey,
      hasSecretKey: !!secretKey,
      storeIdLength: storeId?.length,
      publicKeyLength: publicKey?.length,
      secretKeyLength: secretKey?.length
    });

    // Check if we can make a basic API call
    let swellApiTest = null;
    if (storeId && publicKey) {
      try {
        const url = `https://${storeId}.swell.store/api/products?limit=1`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${storeId}:${publicKey}`).toString('base64')}`,
            'Content-Type': 'application/json'
          }
        });

        swellApiTest = {
          status: response.status,
          ok: response.ok,
          url: url
        };

        console.log('🔍 Swell API test:', swellApiTest);
      } catch (error) {
        console.error('❌ Swell API test failed:', error);
        swellApiTest = { error: error.message };
      }
    }

    return NextResponse.json({
      success: true,
      environment: {
        hasStoreId: !!storeId,
        hasPublicKey: !!publicKey,
        hasSecretKey: !!secretKey,
        storeId: storeId ? `${storeId.substring(0, 8)}...` : 'missing',
        nodeEnv: process.env.NODE_ENV
      },
      swellApiTest,
      message: 'Environment test completed'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
