import { revalidate } from "lib/commerce/swell/client";
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const result = await revalidate(req);
  return NextResponse.json(result);
}
