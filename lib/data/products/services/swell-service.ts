// lib/data/products/index/services/swell-service.ts

import { getSwellProduct } from '../../../commerce/swell/products';
import { SWELL_CONCURRENCY_LIMIT } from '../constants';
import { extractString, extractWeek } from '../utils/extractors';
import { convertSanityProductOnly } from '../utils/transformers';
import { createLimit } from './rate-limit';

const swellLimit = createLimit(SWELL_CONCURRENCY_LIMIT);

export async function enrichWithSwellData(sanityProduct: any) {
  return swellLimit(async () => {
    try {
      let swellProduct = null;

      if (sanityProduct.swellProductId) {
        swellProduct = await getSwellProduct(sanityProduct.swellProductId);
      } else if (sanityProduct.sku) {
        swellProduct = await getSwellProduct(sanityProduct.sku);
      }

      if (!swellProduct) {
        console.log('No swell product found, using Sanity only');
        return convertSanityProductOnly(sanityProduct);
      }

      const imageUrl = sanityProduct.imageUrl || sanityProduct.mainImage?.asset?.url;

      const enrichedProduct = {
        id: swellProduct.id,
        slug:
          swellProduct.slug ||
          sanityProduct.swellSlug ||
          sanityProduct.slug?.current ||
          sanityProduct.sku ||
          sanityProduct._id,
        sku: swellProduct.sku || sanityProduct.sku || sanityProduct._id,
        name: swellProduct.name || sanityProduct.title || 'Untitled',
        price: swellProduct.price || 0,
        currency: swellProduct.currency || 'USD',
        description: swellProduct.description || extractString(sanityProduct.description),
        stock_level: swellProduct.stock_level || 0,
        stock_purchasable: swellProduct.stock_purchasable || false,
        stock_tracking: swellProduct.stock_tracking || false,
        stock_status: swellProduct.stock_status, // Add stock_status from Swell
        featured: sanityProduct.featured || false,
        sanityContent: sanityProduct,
        title: sanityProduct.title || swellProduct.name || 'Untitled',
        artist: extractString(sanityProduct.artist),
        label: extractString(sanityProduct.label),
        format: extractString(sanityProduct.format),
        week: extractWeek(sanityProduct.week),
        category: extractString(sanityProduct.category),
        genre: extractString(sanityProduct.genre),
        country: extractString(sanityProduct.country),
        released: extractString(sanityProduct.released),
        catalog: extractString(sanityProduct.catalog),
        // Added condition fields from Swell product data
        media: swellProduct.media || extractString(sanityProduct.media),
        sleeve: swellProduct.sleeve || extractString(sanityProduct.sleeve),
        notes: swellProduct.notes || extractString(sanityProduct.notes),
        orderRank: sanityProduct.orderRank,
        menuOrder: sanityProduct.menuOrder,
        mainImage: sanityProduct.mainImage,
        additionalImages: sanityProduct.additionalImages,
        gallery: sanityProduct.gallery,
        tracklist: sanityProduct.tracklist || [],
        inMixtapes: sanityProduct.inMixtapes || [],
        tags: sanityProduct.tags || [],
        imageUrl: imageUrl,
        productSlug:
          swellProduct.slug ||
          sanityProduct.swellSlug ||
          sanityProduct.slug?.current ||
          sanityProduct.sku ||
          sanityProduct._id,
        swellProductId: swellProduct.id,
        variants: swellProduct.variants
      };

      return enrichedProduct;
    } catch (error) {
      return convertSanityProductOnly(sanityProduct);
    }
  });
}
