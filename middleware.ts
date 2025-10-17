import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Middleware to protect routes and handle authentication
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Get access token from cookie
  const token = req.cookies.get("access_token")?.value

  // If user is on public path and has token, redirect to home
  if (isPublicPath && token) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // If user is on private path and has no token, redirect to login
  if (!isPublicPath && !token) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api/session/* (session routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/session).*)",
  ],
}
