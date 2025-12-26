// middleware.js
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"

// Define protected route patterns
const AUTH_REQUIRED_ROUTES = ["/stripe", "/onboarding"]
const ADMIN_ROUTES = ["/admin", "/api/admin"]

export async function middleware(req) {
  const { pathname, origin } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token?.email || !token.isAdmin) {
      const callbackUrl = encodeURIComponent(req.nextUrl.pathname)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, origin))
    }
  }

  if (AUTH_REQUIRED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token?.email) {
      const callbackUrl = encodeURIComponent(req.nextUrl.pathname)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, origin))
    }
  }

  // ✅ For all other routes, proceed without tenant resolution
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/stripe/:path*",
    "/onboarding/:path*",
  ],
}