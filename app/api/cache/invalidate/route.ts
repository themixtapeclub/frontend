// app/api/cache/invalidate/route.ts
import { invalidateProductCache } from 'lib/data/products/index';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CACHE_WEBHOOK_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, productId, slug, archiveType } = body;

    switch (type) {
      case 'product_stock_change':
        // Real-time stock changes - invalidate immediately
        if (productId) {
          invalidateProductCache(productId);
          revalidateTag(`product-${productId}`);
        }
        break;

      case 'product_update':
        // Product content changes
        if (productId) {
          invalidateProductCache(productId);
          revalidateTag(`product-${productId}`);
        }
        if (slug) {
          revalidatePath(`/product/${slug}`);
        }
        break;

      case 'archive_update':
        // Archive page changes (new products added to genre, etc.)
        if (archiveType && slug) {
          revalidatePath(`/shop/${archiveType}/${slug}`);
          revalidateTag(`archive-${archiveType}-${slug}`);
        }
        // Also invalidate related caches
        invalidateProductCache();
        break;

      case 'global_invalidate':
        // Full cache clear (use sparingly)
        invalidateProductCache();
        revalidatePath('/shop');
        revalidatePath('/');
        break;

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      invalidated: type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
