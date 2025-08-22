// app/api/swell/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import swell from 'swell-js'; // or whatever your swell import should be

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { where, limit = 100, page = 1 } = body;

    // Example query structure - replace with your actual Swell API call
    const products = (await swell.get('/products', {
      where,
      limit,
      page
    })) as any;

    return NextResponse.json({
      results: products.results || [],
      count: products.count || 0,
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products', success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const artist = searchParams.get('artist');

  if (!artist) {
    return NextResponse.json(
      { error: 'Artist parameter required', success: false },
      { status: 400 }
    );
  }

  try {
    const products = (await swell.get('/products', {
      where: {
        'content.artist': {
          $in: [artist]
        }
      },
      limit: 100
    })) as any;

    return NextResponse.json({
      results: products.results || [],
      count: products.count || 0,
      success: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products', success: false },
      { status: 500 }
    );
  }
}
