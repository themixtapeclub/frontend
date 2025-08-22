import { createClient } from '@sanity/client';

const { swell } = require('swell-node');

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: true
});

// Helper function to upload image from URL to Sanity
async function uploadImageFromUrl(imageUrl, filename) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return null;
    }

    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    const asset = await sanityClient.assets.upload('image', buffer, {
      filename: filename || 'product-image.jpg'
    });

    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    };
  } catch (error) {
    return null;
  }
}

export async function POST(request) {
  try {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID || process.env.SWELL_STORE_ID;
    const secretKey = process.env.SWELL_SECRET_KEY;

    swell.init(storeId, secretKey);

    // Get all Sanity products that have Swell IDs but no main image
    const sanityProducts = await sanityClient.fetch(`
      *[_type == "product" && swellProductId != null && !defined(mainImage)]{
        _id,
        swellProductId,
        title
      }
    `);

    let processedCount = 0;
    let imagesUploadedCount = 0;
    let errorCount = 0;
    let page = 1;
    const limit = 50; // Smaller batches for image processing

    while (true) {
      const swellResponse = await swell.get('/products', {
        limit: limit,
        page: page
      });

      const swellProducts = swellResponse.results;

      if (!swellProducts || swellProducts.length === 0) {
        break;
      }

      for (const swellProduct of swellProducts) {
        try {
          // Find corresponding Sanity product
          const sanityProduct = sanityProducts.find((p) => p.swellProductId === swellProduct.id);

          if (!sanityProduct) {
            continue;
          }

          processedCount++;

          // Check if Swell product has images
          if (!swellProduct.images || swellProduct.images.length === 0) {
            continue;
          }

          // Get the first image URL
          const imageObject = swellProduct.images[0];
          const imageUrl = imageObject.file?.url || imageObject.url;

          if (!imageUrl) {
            continue;
          }

          // Upload to Sanity
          const filename = `${swellProduct.slug || swellProduct.id}-main.jpg`;
          const sanityImage = await uploadImageFromUrl(imageUrl, filename);

          if (sanityImage) {
            // Update Sanity product with the image
            await sanityClient.patch(sanityProduct._id).set({ mainImage: sanityImage }).commit();
            imagesUploadedCount++;
          } else {
            errorCount++;
          }

          // Add delay between image uploads to avoid overwhelming APIs
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (productError) {
          errorCount++;
        }
      }

      // Check if we've processed all pages
      if (swellProducts.length < limit) {
        break;
      }

      page++;

      // Longer delay between pages for image processing
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return Response.json({
      message: 'Swell images sync completed',
      results: {
        sanityProductsWithoutImages: sanityProducts.length,
        productsProcessed: processedCount,
        imagesUploaded: imagesUploadedCount,
        errors: errorCount,
        pagesProcessed: page
      }
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message,
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
}
