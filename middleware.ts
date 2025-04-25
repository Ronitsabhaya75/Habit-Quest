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
