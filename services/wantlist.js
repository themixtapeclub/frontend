// services/wantlist.js
import swell from 'swell-js';

export class WantlistService {
  // Add product to wantlist
  static async addToWantlist(customerId, productId, email, variantId = null) {
    try {
      // Check if item already exists
      const existingItem = await swell.content.list('wantlist_items', {
        where: {
          customer_id: customerId,
          product_id: productId,
          product_variant_id: variantId,
          status: 'active'
        }
      });

      if (existingItem.results.length > 0) {
        return { success: false, message: 'Item already in wantlist' };
      }

      // Add new wantlist item
      const wantlistItem = await swell.content.create('wantlist_items', {
        customer_id: customerId,
        product_id: productId,
        product_variant_id: variantId,
        email: email,
        notify_when_available: true,
        status: 'active'
      });

      return { success: true, item: wantlistItem };
    } catch (error) {
      console.error('Error adding to wantlist:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove from wantlist
  static async removeFromWantlist(customerId, productId, variantId = null) {
    try {
      const items = await swell.content.list('wantlist_items', {
        where: {
          customer_id: customerId,
          product_id: productId,
          product_variant_id: variantId,
          status: 'active'
        }
      });

      const promises = items.results.map((item) =>
        swell.content.update('wantlist_items', item.id, {
          status: 'removed'
        })
      );

      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error removing from wantlist:', error);
      return { success: false, error: error.message };
    }
  }

  // Get customer's wantlist
  static async getWantlist(customerId) {
    try {
      const wantlistItems = await swell.content.list('wantlist_items', {
        where: {
          customer_id: customerId,
          status: 'active'
        },
        sort: 'date_added desc'
      });

      // Populate with product data
      const itemsWithProducts = await Promise.all(
        wantlistItems.results.map(async (item) => {
          const product = await swell.products.get(item.product_id);
          let variant = null;

          if (item.product_variant_id && product.variants) {
            variant = product.variants.find((v) => v.id === item.product_variant_id);
          }

          return {
            ...item,
            product,
            variant
          };
        })
      );

      return { success: true, items: itemsWithProducts };
    } catch (error) {
      console.error('Error getting wantlist:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if product is in wantlist
  static async isInWantlist(customerId, productId, variantId = null) {
    try {
      const items = await swell.content.list('wantlist_items', {
        where: {
          customer_id: customerId,
          product_id: productId,
          product_variant_id: variantId,
          status: 'active'
        }
      });

      return items.results.length > 0;
    } catch (error) {
      console.error('Error checking wantlist:', error);
      return false;
    }
  }

  // Get items to notify for back in stock (for later webhook implementation)
  static async getItemsToNotify(productId, variantId = null) {
    try {
      const whereClause = {
        product_id: productId,
        status: 'active',
        notify_when_available: true
      };

      if (variantId) {
        whereClause.product_variant_id = variantId;
      }

      const items = await swell.content.list('wantlist_items', {
        where: whereClause
      });

      return { success: true, items: items.results };
    } catch (error) {
      console.error('Error getting items to notify:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark items as notified (for later webhook implementation)
  static async markAsNotified(itemIds) {
    try {
      const promises = itemIds.map((id) =>
        swell.content.update('wantlist_items', id, {
          status: 'notified'
        })
      );

      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      console.error('Error marking as notified:', error);
      return { success: false, error: error.message };
    }
  }
}
