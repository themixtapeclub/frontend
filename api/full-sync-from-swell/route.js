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
    if (!response.ok) return null;

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

    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let totalProducts = 0;
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

      totalProducts += swellProducts.length;

      for (const swellProduct of swellProducts) {
        try {
          // Check if product exists in Sanity
          const existingProduct = await sanityClient.fetch(
            `*[_type == "product" && swellProductId == $swellId][0]`,
            { swellId: swellProduct.id }
          );

          // === SWELL-OWNED DATA (always sync) ===
          const swellOwnedData = {
            swellProductId: swellProduct.id,
            title: swellProduct.name,
            sku: swellProduct.sku || null,
            price: swellProduct.price || 0,
            catalog: swellProduct.attributes?.catalog || swellProduct.sku || '',
            inStock: swellProduct.stock_status !== 'out_of_stock',
            lastSyncFromSwell: new Date().toISOString()
          };

          // === SANITY-OWNED DATA (populate from Swell initially, then preserve) ===
          // Parse discogs fields
          const discogsId = swellProduct.attributes?.discogs_release_id
            ? parseInt(swellProduct.attributes.discogs_release_id, 10)
            : undefined;
          const discogsPrice = swellProduct.attributes?.discogs_price
            ? parseFloat(swellProduct.attributes.discogs_price)
            : undefined;

          // Upload main image if available
          let mainImage = null;
          if (swellProduct.images && swellProduct.images.length > 0) {
            const imageObject = swellProduct.images[0];
            const imageUrl = imageObject.file?.url || imageObject.url;

            if (imageUrl) {
              const filename = `${swellProduct.slug || swellProduct.id}-main.jpg`;
              mainImage = await uploadImageFromUrl(imageUrl, filename);
            }
          }

          // Sanity-owned data from Swell (only set on creation or if empty)
          const sanityOwnedData = {
            richDescription: swellProduct.description || '',
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
            tags: swellProduct.tags || [],
            week: swellProduct.content?.week || [],
            country: swellProduct.attributes?.country || '',
            conditionNotes: swellProduct.attributes?.condition_notes || '',
            ...(discogsId && !isNaN(discogsId) && { discogsReleaseId: discogsId }),
            ...(discogsPrice && !isNaN(discogsPrice) && { discogsPrice: discogsPrice }),
            ...(mainImage && { mainImage }),
            needsSyncToSwell: false
          };

          if (existingProduct) {
            // === UPDATE EXISTING PRODUCT ===
            const updateData = {
              // Always update Swell-owned data
              ...swellOwnedData
            };

            // Only update Sanity-owned fields if they're currently empty/undefined
            if (!existingProduct.richDescription && sanityOwnedData.richDescription) {
              updateData.richDescription = sanityOwnedData.richDescription;
            }
            if (
              (!existingProduct.artist || existingProduct.artist.length === 0) &&
              sanityOwnedData.artist.length > 0
            ) {
              updateData.artist = sanityOwnedData.artist;
            }
            if (
              (!existingProduct.label || existingProduct.label.length === 0) &&
              sanityOwnedData.label.length > 0
            ) {
              updateData.label = sanityOwnedData.label;
            }
            if (
              (!existingProduct.genre || existingProduct.genre.length === 0) &&
              sanityOwnedData.genre.length > 0
            ) {
              updateData.genre = sanityOwnedData.genre;
            }
            if (
              (!existingProduct.format || existingProduct.format.length === 0) &&
              sanityOwnedData.format.length > 0
            ) {
              updateData.format = sanityOwnedData.format;
            }
            if (
              (!existingProduct.tags || existingProduct.tags.length === 0) &&
              sanityOwnedData.tags.length > 0
            ) {
              updateData.tags = sanityOwnedData.tags;
            }
            if (
              (!existingProduct.week || existingProduct.week.length === 0) &&
              sanityOwnedData.week.length > 0
            ) {
              updateData.week = sanityOwnedData.week;
            }
            if (!existingProduct.country && sanityOwnedData.country) {
              updateData.country = sanityOwnedData.country;
            }
            if (!existingProduct.conditionNotes && sanityOwnedData.conditionNotes) {
              updateData.conditionNotes = sanityOwnedData.conditionNotes;
            }
            if (!existingProduct.discogsReleaseId && sanityOwnedData.discogsReleaseId) {
              updateData.discogsReleaseId = sanityOwnedData.discogsReleaseId;
            }
            if (!existingProduct.discogsPrice && sanityOwnedData.discogsPrice) {
              updateData.discogsPrice = sanityOwnedData.discogsPrice;
            }
            if (!existingProduct.mainImage && sanityOwnedData.mainImage) {
              updateData.mainImage = sanityOwnedData.mainImage;
            }

            await sanityClient.patch(existingProduct._id).set(updateData).commit();

            updatedCount++;
          } else {
            // === CREATE NEW PRODUCT ===
            const newProduct = {
              _type: 'product',
              ...swellOwnedData,
              ...sanityOwnedData,
              // Initialize empty Sanity-only fields
              artistNameVariation: '',
              tracklist: [],
              additionalImages: [],
              released: null,
              pressingNotes: '',
              curatorNotes: ''
            };

            await sanityClient.create(newProduct);
            createdCount++;
          }

          // Small delay to avoid overwhelming APIs
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (productError) {
          errorCount++;
        }
      }

      // Check if we've got all products
      if (swellProducts.length < limit) {
        break;
      }

      page++;

      // Delay between pages
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return Response.json({
      message: 'Full sync from Swell completed with proper data separation',
      results: {
        totalProcessed: totalProducts,
        pages: page,
        created: createdCount,
        updated: updatedCount,
        errors: errorCount
      },
      dataOwnership: {
        swellOwns: ['title', 'price', 'catalog', 'inStock'],
        sanityOwns: ['richDescription', 'artist', 'tracklist', 'images', 'musicMetadata'],
        note: 'Existing Sanity content was preserved during sync'
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
