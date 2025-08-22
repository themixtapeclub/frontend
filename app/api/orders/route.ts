// app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';

class SwellBackendAPI {
  baseURL: string;
  storeId: string | undefined;
  secretKey: string | undefined;

  constructor() {
    this.baseURL = 'https://api.swell.store';
    this.storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    this.secretKey = process.env.SWELL_SECRET_KEY;
  }

  async request(
    method: string,
    endpoint: string,
    data: any = null,
    retries: number = 2
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const auth = Buffer.from(`${this.storeId}:${this.secretKey}`).toString('base64');

    const options: RequestInit = {
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

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();

          if (response.status >= 500 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }

          throw new Error(`Orders API request failed: ${response.status} ${errorText}`);
        }

        const responseText = await response.text();

        if (!responseText.trim()) {
          return { success: true, empty: true };
        }

        try {
          return JSON.parse(responseText);
        } catch (parseError) {
          return { success: false, parseError: true, text: responseText };
        }
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
}

const swellAPI = new SwellBackendAPI();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get orders for this customer
    const ordersResponse = await swellAPI.request(
      'GET',
      `/orders?account_id=${customerId}&limit=50&sort=date_created desc`
    );

    if (!ordersResponse || !ordersResponse.results) {
      return NextResponse.json({
        success: true,
        orders: []
      });
    }

    const swellOrders = ordersResponse.results;

    // Transform Swell orders to our expected format
    const transformedOrders = swellOrders.map((swellOrder: any) => {
      const transformed = {
        id: swellOrder.id,
        number: swellOrder.number || swellOrder.id,
        status: swellOrder.status || 'pending',
        payment_status: swellOrder.paid ? 'paid' : 'pending',
        fulfillment_status: swellOrder.delivered
          ? 'fulfilled'
          : swellOrder.closed
            ? 'complete'
            : 'pending',
        date_created: swellOrder.date_created,
        date_updated: swellOrder.date_updated,

        // Use exact field names from your original data sample
        subtotal: swellOrder.item_total || 0,
        tax_total: swellOrder.tax_included_total || swellOrder.tax_total || 0,
        shipping_total: swellOrder.shipping_total || 0,
        grand_total: swellOrder.grand_total || 0,

        currency: swellOrder.currency || swellOrder.display_currency || 'USD',
        items: (swellOrder.items || []).map((item: any) => ({
          id: item.id,
          product_id: item.product_id || item.id,
          product_variant_id: item.variant_id,
          product_name: item.product_name || item.description || 'Unknown Product',
          variant_name: item.variant_name,
          quantity: item.quantity || 1,
          price: item.price || 0,
          currency: swellOrder.currency || 'USD',
          product_image: item.product?.images?.[0]?.file?.url || item.product?.image?.url,
          product_slug: item.product?.slug,
          sku: item.product?.sku || item.sku,
          product: item.product,
          variant: item.variant
        })),
        shipping: swellOrder.shipping
          ? {
              name:
                swellOrder.shipping.name ||
                `${swellOrder.shipping.first_name || ''} ${
                  swellOrder.shipping.last_name || ''
                }`.trim(),
              address1: swellOrder.shipping.address1 || '',
              address2: swellOrder.shipping.address2,
              city: swellOrder.shipping.city || '',
              state: swellOrder.shipping.state || '',
              zip: swellOrder.shipping.zip || '',
              country: swellOrder.shipping.country || ''
            }
          : undefined,
        billing: swellOrder.billing
          ? {
              name:
                swellOrder.billing.name ||
                `${swellOrder.billing.first_name || ''} ${
                  swellOrder.billing.last_name || ''
                }`.trim(),
              address1: swellOrder.billing.address1 || '',
              address2: swellOrder.billing.address2,
              city: swellOrder.billing.city || '',
              state: swellOrder.billing.state || '',
              zip: swellOrder.billing.zip || '',
              country: swellOrder.billing.country || ''
            }
          : undefined
      };

      return transformed;
    });

    return NextResponse.json({
      success: true,
      orders: transformedOrders
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch orders',
        orders: []
      },
      { status: 500 }
    );
  }
}
