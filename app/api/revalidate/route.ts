import { revalidate } from "lib/commerce/swell/client";
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const result = await revalidate(req);

    // Ensure we return a proper NextResponse
    if (typeof result === 'object' && result !== null) {
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ success: false, error: 'Revalidation failed' }, { status: 500 });
  }
}
