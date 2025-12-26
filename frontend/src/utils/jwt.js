import { jwtVerify } from "jose";
import { parse } from "cookie";

/**
 * Read and verify the JWT from the HTTP-only cookie.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Object|null>} the decoded JWT payload, or null if missing/invalid
 */
export async function getJwt(req) {
  // 1) parse cookies
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.jwt;
  if (!token) return null;

  // 2) verify
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}