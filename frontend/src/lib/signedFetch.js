import crypto from "crypto";

const EXPECTED_HMAC_SECRET = process.env.EXPECTED_HMAC_SECRET;
const DOMAIN = process.env.DOMAIN;
const API_PREFIX = process.env.API_PREFIX;

if (!EXPECTED_HMAC_SECRET || !DOMAIN || !API_PREFIX) {
  throw new Error("Missing EXPECTED_HMAC_SECRET, DOMAIN, or API_PREFIX in env");
}

/**
 * Generate a secure HMAC-SHA256 signature for a domain.
 * @param {string} domain
 * @returns {string} HMAC hex digest
 */
function generateTenantSignature(domain) {
  return crypto
    .createHmac("sha256", EXPECTED_HMAC_SECRET)
    .update(domain)
    .digest("hex");
}

/**
 * Secure server-side fetch to your FastAPI backend with signed tenant headers.
 * @param {string} path - Relative API path (e.g., "/google-client-credentials")
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function signedFetch(path, options = {}) {
  const domain = DOMAIN;
  const signature = generateTenantSignature(domain);

  return fetch(`https://${DOMAIN}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "X-Tenant-Domain": domain,
      "X-Tenant-Signature": signature,
    },
  });
}