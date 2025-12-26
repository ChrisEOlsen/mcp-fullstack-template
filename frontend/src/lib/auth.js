import { getJwt } from "@/utils/jwt";

/**
 * Checks if the request is from an authenticated admin.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<boolean>}
 */
export async function isAdmin(req) {
  const payload = await getJwt(req);
  return payload?.email && payload?.isAdmin === true;
}

/**
 * Checks if the request is from an authenticated user.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated(req) {
  const payload = await getJwt(req);
  return payload?.email !== undefined;
}