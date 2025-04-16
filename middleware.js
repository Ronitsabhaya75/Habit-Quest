import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const token = request.cookies.get("token")?.value

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/api/auth/login", "/api/auth/register"]

  // Check if the path is public
  const isPublicPath =
    publicPaths.includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/api/auth/")

  // If no token and trying to access protected route
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If token exists and trying to access login page
  if (token && request.nextUrl.pathname === "/") {
    try {
      // Verify token
      const secret = process.env.JWT_SECRET || "your-secret-key"
      jwt.verify(token, secret)

      // Token is valid, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } catch (error) {
      // Token is invalid, continue to login page
      console.error("Token verification failed:", error)

      const response = NextResponse.next()

      // Clear the invalid token
      response.cookies.set({
        name: "token",
        value: "",
        expires: new Date(0),
        path: "/",
      })

      return response
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/mini-games/:path*",
    "/calendar/:path*",
    "/habit-creation/:path*",
    "/fitness/:path*",
    "/shop/:path*",
    "/review/:path*",
    "/api/:path*",
  ],
}
