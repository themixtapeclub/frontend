// app/api/cleanup-wantlist/route.js - Clean up old customer.content.wantlist data
import { NextResponse } from 'next/server';

class SwellBackendAPI {
  constructor() {
    this.baseURL = 'https://api.swell.store';
    this.storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    this.secretKey = process.env.SWELL_SECRET_KEY;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const auth = Buffer.from(`${this.storeId}:${this.secretKey}`).toString('base64');

    const options = {
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

    const response = await fetch(url, options);
    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${responseText}`);
    }

    if (!responseText.trim()) {
      return { success: true, empty: true };
    }

    return JSON.parse(responseText);
  }
}

const swellAPI = new SwellBackendAPI();

export async function POST(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    console.log('🧹 Starting cleanup of old wantlist data...');

    const results = {
      customersProcessed: 0,
      wantlistDataRemoved: 0,
      errors: []
    };

    if (customerId) {
      // Clean up specific customer
      console.log(`🧹 Cleaning up customer: ${customerId}`);

      try {
        const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

        if (customer.content?.wantlist) {
          console.log(`🗑️ Removing wantlist data from customer ${customerId}`);

          const updatedContent = { ...customer.content };
          delete updatedContent.wantlist;

          await swellAPI.request('PUT', `/accounts/${customerId}`, {
            content: updatedContent
          });

          results.customersProcessed = 1;
          results.wantlistDataRemoved = 1;

          console.log(`✅ Cleaned up customer ${customerId}`);
        } else {
          console.log(`ℹ️ Customer ${customerId} has no wantlist data to clean`);
          results.customersProcessed = 1;
        }
      } catch (error) {
        console.error(`❌ Error cleaning customer ${customerId}:`, error.message);
        results.errors.push({
          customerId: customerId,
          error: error.message
        });
      }
    } else {
      // Clean up all customers with wantlist data
      console.log('🧹 Cleaning up all customers with wantlist data...');

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        console.log(`📄 Processing page ${page} of customers...`);

        // Query customers that have wantlist data in content
        const customers = await swellAPI.request(
          'GET',
          `/accounts?where={"content.wantlist":{"$exists":true}}&page=${page}&limit=50`
        );

        if (!customers.results || customers.results.length === 0) {
          hasMore = false;
          break;
        }

        for (const customer of customers.results) {
          results.customersProcessed++;

          try {
            console.log(`🗑️ Removing wantlist data from customer ${customer.id}`);

            const updatedContent = { ...customer.content };
            delete updatedContent.wantlist;

            await swellAPI.request('PUT', `/accounts/${customer.id}`, {
              content: updatedContent
            });

            results.wantlistDataRemoved++;
            console.log(`✅ Cleaned up customer ${customer.id}`);
          } catch (error) {
            console.error(`❌ Error cleaning customer ${customer.id}:`, error.message);
            results.errors.push({
              customerId: customer.id,
              error: error.message
            });
          }
        }

        page++;

        // Prevent infinite loops
        if (page > customers.page_count) {
          hasMore = false;
        }
      }
    }

    console.log('✅ Cleanup completed!');
    console.log(`📊 Results:`, results);

    return NextResponse.json({
      success: true,
      message: 'Wantlist cleanup completed',
      results: results
    });
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET endpoint to check what needs cleaning
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const customerId = searchParams.get('customerId');

    if (customerId) {
      // Check specific customer
      const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

      return NextResponse.json({
        customerId: customerId,
        email: customer.email,
        hasOldWantlistData: !!customer.content?.wantlist,
        oldWantlistCount: customer.content?.wantlist?.length || 0,
        oldWantlistItems: customer.content?.wantlist || []
      });
    }

    // Check all customers with old wantlist data
    const customersWithOldData = await swellAPI.request(
      'GET',
      '/accounts?where={"content.wantlist":{"$exists":true}}&limit=5'
    );

    return NextResponse.json({
      customersWithOldWantlistData: customersWithOldData.count || 0,
      sampleCustomers: (customersWithOldData.results || []).map((customer) => ({
        id: customer.id,
        email: customer.email,
        wantlistItemCount: customer.content?.wantlist?.length || 0
      })),
      needsCleanup: (customersWithOldData.count || 0) > 0
    });
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
