import { createClient } from '@sanity/client';

const { swell } = require('swell-node');

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: true
});

export async function POST(request) {
  try {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID || process.env.SWELL_STORE_ID;
    const secretKey = process.env.SWELL_SECRET_KEY;

    swell.init(storeId, secretKey);

    let updatedCount = 0;
    let errorCount = 0;
    let totalProducts = 0;
    let page = 1;
    const limit = 100; // Swell's max per page

    while (true) {
      const swellResponse = await swell.get('/products', {
        limit: limit,
        page: page
      });

      const swellProducts = swellResponse.results;

      if (!swellProducts || swellProducts.length === 0) {
        break;
      }

      totalProducts += swellProducts.length;

      for (const swellProduct of swellProducts) {
        try {
          // Find existing product in Sanity by swellProductId
          const existingProduct = await sanityClient.fetch(
            `*[_type == "product" && swellProductId == $swellId][0]`,
            { swellId: swellProduct.id }
          );

          if (existingProduct) {
            // Update SKU from Swell
            await sanityClient
              .patch(existingProduct._id)
              .set({
                sku: swellProduct.sku || null,
                lastSyncFromSwell: new Date().toISOString()
              })
              .commit();

            updatedCount++;
          }
        } catch (productError) {
          errorCount++;
        }
      }

      // Check if we've got all products
      if (swellProducts.length < limit) {
        break;
      }

      page++;

      // Optional: Add a small delay between pages to be nice to the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return Response.json({
      message: 'SKU sync from Swell completed (all pages)',
      results: {
        totalProcessed: totalProducts,
        pages: page,
        updated: updatedCount,
        errors: errorCount
      }
    });
  } catch (error) {
    return Response.json(
      {
        error: 'Failed to sync SKUs',
        details: error.message
      },
      { status: 500 }
    );
  }
}
