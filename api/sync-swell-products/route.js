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

    const swellProducts = await swell.get('/products', { limit: 2 }); // Just 2 for debugging

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const swellProduct of swellProducts.results) {
      try {
        // Check if product exists in Sanity
        const existingProduct = await sanityClient.fetch(
          `*[_type == "product" && swellProductId == $swellId][0]`,
          { swellId: swellProduct.id }
        );

        // Parse discogs fields
        const discogsId = swellProduct.attributes?.discogs_release_id
          ? parseInt(swellProduct.attributes.discogs_release_id, 10)
          : undefined;
        const discogsPrice = swellProduct.attributes?.discogs_price
          ? parseFloat(swellProduct.attributes.discogs_price)
          : undefined;

        // Upload main image if it exists
        let mainImage = null;
        if (swellProduct.images && swellProduct.images.length > 0) {
          const imageObject = swellProduct.images[0];
          const imageUrl = imageObject.file?.url || imageObject.url;

          if (imageUrl) {
            const filename = `${swellProduct.slug || swellProduct.id}-main.jpg`;
            mainImage = await uploadImageFromUrl(imageUrl, filename);
          }
        }

        // Rest of your product mapping code stays the same...
        const productData = {
          _type: 'product',
          swellProductId: swellProduct.id,
          title: swellProduct.name,
          description: swellProduct.description || '',
          price: swellProduct.price || 0,
          catalog: swellProduct.attributes?.catalog || swellProduct.sku || '',
          artist: swellProduct.content?.artist || [],
          label: swellProduct.content?.label || [],
          genre: (swellProduct.content?.genre || []).map((g, index) => ({
            _key: `genre-${swellProduct.id}-${index}`,
            main: g,
            sub: ''
          })),
          format: (swellProduct.content?.format || []).map((f, index) => ({
            _key: `format-${swellProduct.id}-${index}`,
            main: f,
            sub: ''
          })),
          week: swellProduct.content?.week || [],
          tags: swellProduct.tags || [],
          type: swellProduct.attributes?.media_condition === 'Mint' ? 'new' : 'secondhand',
          syncedFromSwell: true,
          lastSyncDate: new Date().toISOString()
        };

        // Add optional fields
        if (discogsId && !isNaN(discogsId)) {
          productData.discogsReleaseId = discogsId;
        }
        if (discogsPrice && !isNaN(discogsPrice)) {
          productData.discogsPrice = discogsPrice;
        }
        if (swellProduct.attributes?.condition_notes) {
          productData.conditionNotes = swellProduct.attributes.condition_notes;
        }
        if (mainImage) {
          productData.mainImage = mainImage;
        }

        if (existingProduct) {
          const updateData = {
            title: swellProduct.name,
            description: swellProduct.description || '',
            price: swellProduct.price || 0,
            lastSyncDate: new Date().toISOString()
          };

          if (mainImage) {
            updateData.mainImage = mainImage;
          }

          await sanityClient.patch(existingProduct._id).set(updateData).commit();
          updatedCount++;
        } else {
          await sanityClient.create(productData);
          createdCount++;
        }
      } catch (productError) {
        errorCount++;
      }
    }

    return Response.json({
      message: 'Sync completed successfully',
      results: {
        total: swellProducts.results.length,
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
