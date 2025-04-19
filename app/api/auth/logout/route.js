import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 })

    // Clear the token cookie with proper attributes
    response.cookies.set({
      name: "token",
      value: "",
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
