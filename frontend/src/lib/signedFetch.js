import crypto from "crypto";

const TENANT_SIGNING_SECRET = process.env.TENANT_SIGNING_SECRET;
const BACKEND_URL = process.env.FASTAPI_URL;

if (!TENANT_SIGNING_SECRET || !BACKEND_URL) {
  throw new Error("Missing TENANT_SIGNING_SECRET or FASTAPI_URL in env");
}

/**
 * Generate a secure HMAC-SHA256 signature for a domain.
 * @param {string} domain
 * @returns {string} HMAC hex digest
 */
function generateTenantSignature(domain) {
  return crypto
    .createHmac("sha256", TENANT_SIGNING_SECRET)
    .update(domain)
    .digest("hex");
}

/**
 * Secure server-side fetch to your FastAPI backend with signed tenant headers.
 * @param {string} path - Relative API path (e.g., "/google-client-credentials")
 * @param {IncomingMessage} req - The Next.js API or SSR request object (to get host)
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function signedFetch(path, req, options = {}, domainOverride) {
  const domain = domainOverride || req?.headers?.host;
  if (!domain) {
    throw new Error("Missing Host header on request");
  }

  const signature = generateTenantSignature(domain);

  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "X-Tenant-Domain": domain,
      "X-Tenant-Signature": signature,
    },
  });
}