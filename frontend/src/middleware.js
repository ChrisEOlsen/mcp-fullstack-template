import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_COOKIE_NAME = "jwt";

// --- MCP will insert AUTH_REQUIRED_ROUTES here ---
const AUTH_REQUIRED_ROUTES = [];

// --- MCP will insert ADMIN_ROUTES here ---
const ADMIN_ROUTES = [];

const EXEMPT_PATHS = [
  "/login",
  "/auth/receive",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host");

  // 1) skip exempt paths
  if (EXEMPT_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2) Parse JWT to determine authentication status
  const jwtCookie = req.cookies.get(JWT_COOKIE_NAME);
  let payload = null;

  if (jwtCookie) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      ({ payload } = await jwtVerify(jwtCookie.value, secret));
    } catch (err) {
      console.error("❌ Invalid JWT:", err);
    }
  }

  // 3) Admin-only routes guard
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!payload?.email || !payload.isAdmin) {
      // Redirect to login with the 'admin' role specified
      const loginUrl = new URL("/login", `https://${host}`);
      loginUrl.searchParams.set("role", "admin");
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4) General authenticated routes guard (after admin check)
  if (AUTH_REQUIRED_ROUTES.some(r => pathname.startsWith(r))) {
    if (!payload?.email) {
      // If it's an API route, send a 401 Unauthorized error
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      
      // Otherwise, it's a page, so redirect to login
      return NextResponse.redirect(new URL("/login", `https://${host}`));
    }
  }

  // For all valid, non-exempt requests, just proceed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // apply to everything except Next internals and your auth endpoints
    "/((?!_next/static|_next/image|favicon.ico|api/auth|auth/receive).*) traditions of the project.)",
  ],
};