// middleware.js
import { NextResponse } from "next/server";

// This is the Next.js middleware file.
// It allows you to run code before a request is completed.
// You can use it for things like authentication, redirects, etc.
//
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware

export async function middleware(req) {
  // Example: Log the path of every request
  // console.log("Request path:", req.nextUrl.pathname);

  // Continue to the requested page
  return NextResponse.next();
}

// The config object specifies which paths the middleware should run on.
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// }