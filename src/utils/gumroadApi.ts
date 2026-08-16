export interface GumroadVerifyResponse {
  success: boolean;
  uses?: number;
  purchase?: {
    id: string;
    product_id: string;
    product_name: string;
    permalink: string;
    email: string;
    price: number;
    currency: string;
    refunded: boolean;
    disputed: boolean;
    chargebacked: boolean;
    created_at: string;
  };
  message?: string;
}

/**
 * Directly verifies a license key against Gumroad's public API.
 * Gumroad's /v2/licenses/verify endpoint supports CORS for client-side apps.
 *
 * IMPORTANT: this only returns success when Gumroad's API actually confirms
 * the key. It does NOT fall back to "accept anything 6+ characters" on a
 * network error or blocked request — that previously meant any failed
 * request (e.g. a misconfigured Content-Security-Policy, like this app
 * shipped with earlier) silently granted access to anyone. A failed
 * request is now always treated as "couldn't verify," never as "valid."
 */
export async function verifyGumroadLicense(
  licenseKey: string,
  productPermalink: string = ''
): Promise<{ success: boolean; email?: string; name?: string; message?: string }> {
  try {
    const formData = new URLSearchParams();
    formData.append('license_key', licenseKey);
    if (productPermalink) {
      formData.append('product_permalink', productPermalink);
    }

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Could not verify with Gumroad right now (status ${response.status}). Please try again in a moment.`
      };
    }

    const data: GumroadVerifyResponse = await response.json();

    if (data.success && data.purchase) {
      if (data.purchase.refunded || data.purchase.disputed || data.purchase.chargebacked) {
        return {
          success: false,
          message: 'This license key has been refunded or disputed.'
        };
      }
      return {
        success: true,
        email: data.purchase.email,
        name: data.purchase.email.split('@')[0],
      };
    }

    return {
      success: false,
      message: data.message || 'Invalid Gumroad license key.'
    };
  } catch (err) {
    // Network error, offline, or blocked request — never silently succeed here.
    return {
      success: false,
      message: 'Could not reach Gumroad to verify this key. Check your connection and try again.'
    };
  }
}
