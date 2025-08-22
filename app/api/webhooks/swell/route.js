// app/api/webhooks/swell/route.js - Updated to use Klaviyo for email notifications

import { NextResponse } from 'next/server';

class SwellBackendAPI {
  constructor() {
    this.baseURL = 'https://api.swell.store';
    this.storeId = process.env.NEXT_PUBLIC_SWELL_STORE_ID;
    this.secretKey = process.env.SWELL_SECRET_KEY;
  }

  async request(method, endpoint, data = null, retries = 2) {
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

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status >= 500 && attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(`Swell API request failed: ${response.status} ${errorText}`);
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

class KlaviyoAPI {
  constructor() {
    this.baseURL = 'https://a.klaviyo.com/api';
    this.apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;

    const options = {
      method,
      headers: {
        Authorization: `Klaviyo-API-Key ${this.apiKey}`,
        'Content-Type': 'application/json',
        revision: '2024-07-15'
      },
      signal: AbortSignal.timeout(15000)
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Klaviyo API request failed: ${response.status} ${errorText}`);
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        return { success: true, empty: true };
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error('Klaviyo API error:', error);
      throw error;
    }
  }

  // Create or update customer profile
  async upsertProfile(email, customerData = {}) {
    try {
      const profileData = {
        data: {
          type: 'profile',
          attributes: {
            email: email,
            ...customerData
          }
        }
      };

      const result = await this.request('POST', '/profiles/', profileData);
      return result.data;
    } catch (error) {
      console.error('Error upserting profile:', error);
      return null;
    }
  }

  // Track custom event (back in stock)
  async trackEvent(profileId, eventName, properties = {}) {
    try {
      const eventData = {
        data: {
          type: 'event',
          attributes: {
            profile: {
              data: {
                type: 'profile',
                id: profileId
              }
            },
            metric: {
              data: {
                type: 'metric',
                attributes: {
                  name: eventName
                }
              }
            },
            properties: properties,
            time: new Date().toISOString()
          }
        }
      };

      const result = await this.request('POST', '/events/', eventData);
      return result;
    } catch (error) {
      console.error('Error tracking event:', error);
      return null;
    }
  }

  // Send back-in-stock email using Klaviyo template
  async sendBackInStockEmail(email, productData, customerData = {}) {
    try {
      console.log('📧 Sending Klaviyo back-in-stock email to:', email);

      // First, upsert the customer profile
      const profile = await this.upsertProfile(email, customerData);

      if (!profile) {
        console.error('❌ Failed to create/update profile');
        return false;
      }

      // Track the "Back in Stock" event
      const eventResult = await this.trackEvent(profile.id, 'Back in Stock', {
        // Product properties for the email template
        product_id: productData.id,
        product_name: productData.name,
        product_url: productData.url,
        product_image: productData.image,
        product_price: productData.price,
        product_price_formatted: productData.priceFormatted,
        product_description: productData.description,
        product_sku: productData.sku,
        variant_name: productData.variantName,
        variant_id: productData.variantId,

        // Store properties
        store_name: process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store',
        store_url: process.env.NEXT_PUBLIC_SITE_URL,

        // Wantlist properties
        date_added_to_wantlist: productData.dateAdded,
        notification_type: 'back_in_stock'
      });

      if (eventResult) {
        console.log('✅ Klaviyo event tracked successfully');
        return true;
      } else {
        console.error('❌ Failed to track Klaviyo event');
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending Klaviyo email:', error);
      return false;
    }
  }
}

const swellAPI = new SwellBackendAPI();
const klaviyoAPI = new KlaviyoAPI();

// Helper function to normalize variant values
const normalizeVariant = (variant) => {
  if (!variant || variant === 'undefined' || variant === 'null') return null;
  return variant;
};

// Get wantlist items for a specific product
async function getWantlistForProduct(productId, variantId = null) {
  try {
    console.log('🔍 Getting wantlist for product:', productId, 'variant:', variantId);

    const allItems = await swellAPI.request('GET', `/wantlist?limit=100`);

    const productItems = (allItems.results || []).filter((item) => {
      const content = item.content;
      const productMatch = content?.product_id === productId;
      const statusMatch = content?.status === 'active';
      const notifyMatch = content?.notify_when_available === true;

      if (variantId) {
        const variantMatch = content?.product_variant_id === variantId;
        return productMatch && statusMatch && notifyMatch && variantMatch;
      }

      return productMatch && statusMatch && notifyMatch;
    });

    console.log('✅ Found', productItems.length, 'wantlist items for product');
    return productItems;
  } catch (error) {
    console.error('❌ Error getting wantlist for product:', error);
    return [];
  }
}

// Format product data for Klaviyo
function formatProductDataForKlaviyo(product, variant = null, wantlistItem = null) {
  const productName = variant ? `${product.name} (${variant.name})` : product.name;
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`;
  const productImage = product.images?.[0]?.file?.url || product.images?.[0]?.url || '';

  // Format price
  let priceFormatted = '';
  let priceValue = 0;

  if (product.price) {
    priceValue = product.price > 1000 ? product.price / 100 : product.price;
    priceFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD'
    }).format(priceValue);
  }

  return {
    id: product.id,
    name: productName,
    url: productUrl,
    image: productImage,
    price: priceValue,
    priceFormatted: priceFormatted,
    description: product.description || '',
    sku: product.sku || '',
    variantName: variant?.name || '',
    variantId: variant?.id || '',
    dateAdded: wantlistItem?.content?.date_added || ''
  };
}

// Get customer data from Swell
async function getCustomerData(customerId) {
  try {
    if (!customerId || customerId.startsWith('guest_')) {
      return {};
    }

    const customer = await swellAPI.request('GET', `/accounts/${customerId}`);

    if (!customer) {
      return {};
    }

    return {
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone_number: customer.phone || '',
      // Add more customer fields as needed
      customer_id: customerId,
      total_orders: customer.order_count || 0,
      total_spent: customer.order_value || 0
    };
  } catch (error) {
    console.error('Error getting customer data:', error);
    return {};
  }
}

// Update wantlist item notification status
async function updateWantlistNotificationStatus(itemId, productId, variantId = null) {
  try {
    console.log('🔄 Updating notification status for item:', itemId);

    const item = await swellAPI.request('GET', `/wantlist/${itemId}`);

    if (!item || !item.content) {
      console.error('❌ Item not found:', itemId);
      return false;
    }

    const updatedContent = {
      ...item.content,
      last_notified: new Date().toISOString(),
      notification_sent: true,
      last_stock_status: 'available',
      notification_method: 'klaviyo'
    };

    await swellAPI.request('PUT', `/wantlist/${itemId}`, {
      content: updatedContent
    });

    console.log('✅ Updated notification status for item:', itemId);
    return true;
  } catch (error) {
    console.error('❌ Error updating notification status:', error);
    return false;
  }
}

// Main notification handler using Klaviyo
async function handleBackInStockNotification(product, changedVariants = []) {
  try {
    console.log('🚀 Processing back-in-stock notification for:', product.name);

    let totalNotifications = 0;

    // Handle product-level stock change
    if (product.stock_status === 'available' && changedVariants.length === 0) {
      const wantlistItems = await getWantlistForProduct(product.id);

      for (const item of wantlistItems) {
        const content = item.content;

        // Skip if already notified recently (within 24 hours)
        if (content.last_notified) {
          const lastNotified = new Date(content.last_notified);
          const hoursSinceNotified = (Date.now() - lastNotified.getTime()) / (1000 * 60 * 60);
          if (hoursSinceNotified < 24) {
            console.log('⏭️ Skipping notification - already sent within 24h');
            continue;
          }
        }

        // Get customer data for personalization
        const customerData = await getCustomerData(content.customer_id);

        // Format product data for Klaviyo
        const productData = formatProductDataForKlaviyo(product, null, item);

        // Send Klaviyo email
        const emailSent = await klaviyoAPI.sendBackInStockEmail(
          content.email,
          productData,
          customerData
        );

        if (emailSent) {
          await updateWantlistNotificationStatus(item.id, product.id);
          totalNotifications++;
        }
      }
    }

    // Handle variant-level stock changes
    for (const variant of changedVariants) {
      if (variant.stock_status === 'available') {
        const wantlistItems = await getWantlistForProduct(product.id, variant.id);

        for (const item of wantlistItems) {
          const content = item.content;

          // Skip if already notified recently
          if (content.last_notified) {
            const lastNotified = new Date(content.last_notified);
            const hoursSinceNotified = (Date.now() - lastNotified.getTime()) / (1000 * 60 * 60);
            if (hoursSinceNotified < 24) {
              continue;
            }
          }

          // Get customer data
          const customerData = await getCustomerData(content.customer_id);

          // Format product data with variant info
          const productData = formatProductDataForKlaviyo(product, variant, item);

          // Send Klaviyo email with variant info
          const emailSent = await klaviyoAPI.sendBackInStockEmail(
            content.email,
            productData,
            customerData
          );

          if (emailSent) {
            await updateWantlistNotificationStatus(item.id, product.id, variant.id);
            totalNotifications++;
          }
        }
      }
    }

    console.log('✅ Sent', totalNotifications, 'Klaviyo back-in-stock notifications');
    return totalNotifications;
  } catch (error) {
    console.error('❌ Error in handleBackInStockNotification:', error);
    return 0;
  }
}

// Webhook verification (implement if Swell provides signature verification)
function verifyWebhookSignature(body, signature, secret) {
  return true; // Implement signature verification for security
}

// Main webhook handler
export async function POST(request) {
  try {
    console.log('🎣 Received Swell webhook');

    const body = await request.json();
    const signature = request.headers.get('x-swell-signature');

    // Verify webhook signature (implement if Swell provides it)
    if (signature && !verifyWebhookSignature(body, signature, process.env.SWELL_WEBHOOK_SECRET)) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('📦 Webhook event:', body.type, 'for:', body.data?.name || body.data?.id);

    // Handle different webhook events
    switch (body.type) {
      case 'product.updated':
        const product = body.data;

        if (product.stock_status === 'available') {
          console.log('📈 Product became available:', product.name);
          await handleBackInStockNotification(product);
        }

        if (product.variants?.results) {
          const availableVariants = product.variants.results.filter(
            (variant) => variant.stock_status === 'available'
          );

          if (availableVariants.length > 0) {
            console.log('📈 Variants became available:', availableVariants.length);
            await handleBackInStockNotification(product, availableVariants);
          }
        }
        break;

      case 'variant.updated':
        const variant = body.data;
        if (variant.stock_status === 'available' && variant.parent_id) {
          console.log('📈 Variant became available:', variant.name);

          const parentProduct = await swellAPI.request('GET', `/products/${variant.parent_id}`);
          if (parentProduct) {
            await handleBackInStockNotification(parentProduct, [variant]);
          }
        }
        break;

      default:
        console.log('ℹ️ Unhandled webhook event:', body.type);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully with Klaviyo'
    });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Swell webhook endpoint ready with Klaviyo integration',
    timestamp: new Date().toISOString()
  });
}
