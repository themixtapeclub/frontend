import { createClient } from '@sanity/client';

const { swell } = require('swell-node');

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  useCdn: true
});

// Helper function to upload Sanity image to Swell
async function uploadSanityImageToSwell(sanityImageRef) {
  try {
    // Get Sanity image URL
    const imageUrl = sanityClient.config().dataset
      ? `https://cdn.sanity.io/images/${sanityClient.config().projectId}/${
          sanityClient.config().dataset
        }/${sanityImageRef._ref
          .replace('image-', '')
          .replace('-jpg', '.jpg')
          .replace('-png', '.png')}`
      : null;

    if (!imageUrl) return null;

    // Upload to Swell (you might need to adjust this based on Swell's image upload API)
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();

    // This is a simplified example - check Swell's actual image upload API
    const swellImage = await swell.post('/uploads', {
      file: Buffer.from(imageBuffer),
      filename: 'product-image.jpg'
    });

    return swellImage.url;
  } catch (error) {
    console.error('Failed to upload image to Swell:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID || process.env.SWELL_STORE_ID;
    const secretKey = process.env.SWELL_SECRET_KEY;

    swell.init(storeId, secretKey);

    // Get Sanity products that need syncing to Swell
    const sanityProducts = await sanityClient.fetch(`
      *[_type == "product" && swellProductId != null && (needsSyncToSwell == true || !defined(lastSyncToSwell) || lastSyncToSwell < _updatedAt)]{
        _id,
        _updatedAt,
        swellProductId,
        richDescription,
        artist,
        label,
        genre,
        format,
        tags,
        mainImage
      }
    `);

    let updatedCount = 0;
    let errorCount = 0;

    for (const sanityProduct of sanityProducts) {
      try {
        // Prepare content data for Swell
        const contentUpdate = {
          description: sanityProduct.richDescription || '',
          content: {
            artist: sanityProduct.artist || [],
            label: sanityProduct.label || [],
            genre: sanityProduct.genre?.map((g) => g.main).filter(Boolean) || [],
            format: sanityProduct.format?.map((f) => f.main).filter(Boolean) || []
          },
          tags: sanityProduct.tags || []
        };

        // Upload main image if it exists
        if (sanityProduct.mainImage?.asset?._ref) {
          const swellImageUrl = await uploadSanityImageToSwell(sanityProduct.mainImage.asset);
          if (swellImageUrl) {
            contentUpdate.images = [swellImageUrl];
          }
        }

        // Update Swell product with content enhancements
        await swell.put(`/products/${sanityProduct.swellProductId}`, contentUpdate);

        // Mark as synced in Sanity
        await sanityClient
          .patch(sanityProduct._id)
          .set({
            lastSyncToSwell: new Date().toISOString(),
            needsSyncToSwell: false
          })
          .commit();

        updatedCount++;
      } catch (productError) {
        console.error(`✗ Error syncing ${sanityProduct.swellProductId}:`, productError.message);
        errorCount++;
      }
    }

    return Response.json({
      message: 'Sanity → Swell content sync completed',
      results: {
        total: sanityProducts.length,
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
