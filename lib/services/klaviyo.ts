// lib/klaviyo.ts
interface SubscriptionMetadata {
  [key: string]: any;
}

interface EventProperties {
  [key: string]: any;
}

class KlaviyoService {
  private publicKey: string;

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY || '';
  }

  // Client-side subscription (with bot protection)
  async subscribeEmail(
    email: string,
    lists: string[] = [],
    metadata: SubscriptionMetadata = {}
  ): Promise<{ message: string; profileId?: string }> {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch('/api/klaviyo/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          lists,
          metadata,
          timestamp: metadata.form_timestamp || Date.now(), // Use form submission time if provided
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Subscription failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw new Error(error instanceof Error ? error.message : 'Subscription failed');
    }
  }

  // Track custom events
  async trackEvent(
    email: string,
    eventName: string,
    properties: EventProperties = {}
  ): Promise<void> {
    try {
      await fetch('/api/klaviyo/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          eventName,
          properties
        })
      });
    } catch (error) {
      console.error('Event tracking failed:', error);
    }
  }
}

export const klaviyo = new KlaviyoService();
