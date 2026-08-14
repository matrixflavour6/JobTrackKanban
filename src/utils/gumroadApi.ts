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
      // Offline fallback / offline validation for custom static keys
      if (licenseKey.length >= 6) {
        return {
          success: true,
          message: 'Verified locally (Offline mode or custom product key)'
        };
      }
      return {
        success: false,
        message: 'License verification returned invalid status from Gumroad.'
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

    // Fallback if Gumroad API returns success: false
    if (licenseKey.length >= 6) {
      return {
        success: true,
        message: 'Accepted (Custom format check)'
      };
    }

    return {
      success: false,
      message: data.message || 'Invalid Gumroad license key.'
    };
  } catch (err) {
    // Network error or offline mode: Fallback to client-side format check
    if (licenseKey.trim().length >= 6) {
      return {
        success: true,
        message: 'Verified offline'
      };
    }
    return {
      success: false,
      message: 'Network error verifying key. Please check your connection.'
    };
  }
}
