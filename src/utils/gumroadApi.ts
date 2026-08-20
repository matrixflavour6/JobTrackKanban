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

// Gumroad requires product_id (not product_permalink) for any product
// created on or after Jan 9, 2023 — confirmed in Gumroad's own docs:
// https://gumroad.com/help/article/76-license-keys
// Find this in Gumroad → Products → your product → Share → API.
const GUMROAD_PRODUCT_ID = 'QxBTITwWl2IUymkaZOnsDw==';

/**
 * Verifies a license key directly against Gumroad's public API.
 *
 * IMPORTANT — this deliberately does NOT include any of the following,
 * which a previous version of this file did, and which completely
 * defeated the purpose of a paywall:
 *   - hardcoded "master" keys that always succeed
 *   - a prefix-based bypass (e.g. any key starting with "PRO-" or "DEV-")
 *   - a fallback that treats a failed/blocked/offline request as success
 *     for any 8+ character string
 * A failed or blocked network request is always treated as "could not
 * verify," never as "valid." If you need a way to test the app yourself
 * without a real purchase, keep that entirely out of this file — e.g. a
 * local-only dev flag that never ships in the production build.
 */
export async function verifyGumroadLicense(
  licenseKey: string,
  productId: string = GUMROAD_PRODUCT_ID
): Promise<{ success: boolean; email?: string; name?: string; message?: string }> {
  const cleanedKey = licenseKey.trim();

  if (!cleanedKey) {
    return { success: false, message: 'Please enter your license key.' };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('license_key', cleanedKey);
    formData.append('product_id', productId);

    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    let data: GumroadVerifyResponse | null = null;
    try {
      data = await response.json();
    } catch {
      // Response wasn't valid JSON — fall through to the generic error below.
    }

    if (response.ok && data?.success && data?.purchase) {
      if (data.purchase.refunded || data.purchase.disputed || data.purchase.chargebacked) {
        return {
          success: false,
          message: 'This license key has been refunded or disputed.',
        };
      }
      return {
        success: true,
        email: data.purchase.email,
        name: data.purchase.email.split('@')[0],
      };
    }

    if (data?.message) {
      return { success: false, message: data.message };
    }

    if (response.status >= 500) {
      return {
        success: false,
        message: 'Gumroad is temporarily unavailable. Please try again in a moment — this never unlocks access on its own.',
      };
    }

    return {
      success: false,
      message: `Invalid license key (status ${response.status}).`,
    };
  } catch (err) {
    // Network error, offline, CSP block, ad-blocker, etc. — never silently
    // succeed here. A blocked request is not proof of purchase.
    return {
      success: false,
      message: 'Could not reach Gumroad to verify this key. Check your connection and try again.',
    };
  }
}
