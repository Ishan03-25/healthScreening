import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes - only accessible by admin
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/screening", req.url))
      }
    }

    // Screening routes - accessible by admin, doctor, and user
    if (path.startsWith("/screening")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Public routes that don't require authentication
        if (
          path.startsWith("/auth") ||
          path === "/" ||
          path.startsWith("/api/auth")
        ) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/screening/:path*",
    "/dashboard/:path*",
  ],
}
