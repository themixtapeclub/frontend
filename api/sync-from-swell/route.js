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

    let createdCount = 0;
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
          // Check if product exists in Sanity
          const existingProduct = await sanityClient.fetch(
            `*[_type == "product" && swellProductId == $swellId][0]`,
            { swellId: swellProduct.id }
          );

          // Only sync commerce-critical data from Swell
          const swellOwnedData = {
            swellProductId: swellProduct.id,
            title: swellProduct.name,
            price: swellProduct.price || 0,
            catalog: swellProduct.attributes?.catalog || swellProduct.sku || '',
            inStock: swellProduct.stock_status !== 'out_of_stock',
            lastSyncFromSwell: new Date().toISOString()
          };

          if (existingProduct) {
            // Update only Swell-owned fields, preserve all Sanity content
            await sanityClient.patch(existingProduct._id).set(swellOwnedData).commit();
            updatedCount++;
          } else {
            // Create new product with Swell data + empty Sanity fields
            const newProduct = {
              _type: 'product',
              ...swellOwnedData,
              // Initialize empty Sanity-owned fields
              richDescription: '',
              artist: [],
              label: [],
              genre: [],
              format: [],
              tags: [],
              tracklist: [],
              needsSyncToSwell: false
            };

            await sanityClient.create(newProduct);
            createdCount++;
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
      message: 'Swell → Sanity sync completed (all pages)',
      results: {
        totalProcessed: totalProducts,
        pages: page,
        created: createdCount,
        updated: updatedCount,
        errors: errorCount
      }
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message
      },
      { status: 500 }
    );
  }
}
