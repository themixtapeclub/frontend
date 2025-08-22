// lib/swell/wantlist.ts

interface WantlistItem {
  product_id: string;
  product_variant_id?: string | null;
  [key: string]: any;
}

interface WantlistResult {
  success: boolean;
  items?: WantlistItem[];
  error?: string;
  message?: string;
}

export class WantlistService {
  private static baseUrl = '/api/wantlist';

  static async getWantlist(customerId: string, email?: string | null): Promise<WantlistResult> {
    try {
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (email && email !== 'null') params.append('email', email);

      params.append('_t', Date.now().toString());

      const url = `${this.baseUrl}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async addToWantlist(
    customerId: string,
    productId: string,
    email: string,
    variantId?: string
  ): Promise<WantlistResult> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId,
          productId,
          email,
          variantId: variantId || null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async removeFromWantlist(
    customerId: string,
    productId: string,
    email: string,
    variantId?: string | null
  ): Promise<WantlistResult> {
    try {
      const params = new URLSearchParams({
        productId
      });

      if (customerId) params.append('customerId', customerId);
      if (email) params.append('email', email);
      if (variantId) params.append('variantId', variantId);

      params.append('_t', Date.now().toString());

      const url = `${this.baseUrl}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async getWantlistCount(
    customerId: string,
    email?: string
  ): Promise<{
    success: boolean;
    count: number;
    error?: string;
  }> {
    try {
      const result = await this.getWantlist(customerId, email);
      if (result.success) {
        const count = result.items?.length || 0;
        return { success: true, count };
      } else {
        return { success: false, count: 0, error: result.error };
      }
    } catch (error: any) {
      return { success: false, count: 0, error: error.message };
    }
  }

  static async isInWantlist(
    customerId: string,
    productId: string,
    email: string,
    variantId?: string | null
  ): Promise<{
    success: boolean;
    isInWantlist: boolean;
    error?: string;
  }> {
    try {
      const result = await this.getWantlist(customerId, email);
      if (result.success) {
        const isInWantlist =
          result.items?.some((item: WantlistItem) => {
            const productMatch = item.product_id === productId;
            const variantMatch =
              item.product_variant_id === variantId ||
              ((!item.product_variant_id || item.product_variant_id === undefined) &&
                (!variantId || variantId === null));
            return productMatch && variantMatch;
          }) || false;

        return { success: true, isInWantlist };
      } else {
        return { success: false, isInWantlist: false, error: result.error };
      }
    } catch (error: any) {
      return { success: false, isInWantlist: false, error: error.message };
    }
  }
}
