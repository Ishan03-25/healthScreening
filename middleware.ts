import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/api/auth/signin",
    "/api/auth/signout",
    "/api/auth/session",
    "/api/auth/providers",
    "/api/auth/callback",
    "/api/auth/csrf",
  ]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  // Also allow [...nextauth] API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token (works in Edge Runtime) - must pass secret explicitly for production
  // secureCookie: true tells getToken to look for __Secure- prefixed cookie on HTTPS
  const isSecure = process.env.NODE_ENV === "production"
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isSecure,
  })

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL("/auth/login", request.url)
    return NextResponse.redirect(url)
  }

  // Check admin routes
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      const url = new URL("/screening", request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
