import { NextResponse } from 'next/server';

export async function GET() {
  const storeId = process.env.SWELL_STORE_ID;
  const publicKey = process.env.SWELL_PUBLIC_KEY;

  if (!storeId || !publicKey) {
    return NextResponse.json(
      {
        error: 'Missing environment variables',
        storeId: !!storeId,
        publicKey: !!publicKey
      },
      { status: 400 }
    );
  }

  try {
    // Test basic Swell API call
    const response = await fetch(`https://${storeId}.swell.store/api/products?limit=1`, {
      headers: {
        Authorization: `Bearer ${publicKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: 'Swell API failed',
          status: response.status,
          message: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      productCount: data?.results?.length || 0,
      apiStatus: 'Working'
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Network error',
        message: error.message
      },
      { status: 500 }
    );
  }
}
