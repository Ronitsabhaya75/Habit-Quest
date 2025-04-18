import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname

  // Check if the user is authenticated (based on the token cookie)
  const token = request.cookies.get("token")?.value

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register"]
  const isPublicPath = publicPaths.includes(pathname)

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If token exists and trying to access login/register page, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
