/**
 * Middleware for handling authentication and routing in a Next.js application.
 * 
 * This middleware checks the user's authentication status based on a token stored in cookies
 * and handles redirection based on the user's access to certain paths.
 * 
 * Functionality:
 * 
 * 1. Redirects unauthenticated users trying to access protected paths to the login page.
 * 2. Redirects authenticated users trying to access the login or register pages to the dashboard.
 * 
 * Public paths that do not require authentication:
 * - "/" (home)
 * - "/login" (login page)
 * - "/register" (registration page)
 * 
 * Configuration:
 * - Applies to all request paths except for API calls, static files, images, and favicon.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Check if the user is authenticated (based on the token cookie)
  const token = request.cookies.get("token")?.value;

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register"];
  const isPublicPath = publicPaths.includes(pathname);

  // Redirect logic for unauthenticated users
  if (!token && !isPublicPath) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logic for authenticated users
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configuration for path matching
export const config = {
  matcher: [
    // Match all request paths except for the specified patterns
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
