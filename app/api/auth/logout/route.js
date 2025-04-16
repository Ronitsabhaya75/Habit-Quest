import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 })

    // Clear the token cookie
    response.cookies.set({
      name: "token",
      value: "",
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 })
  }
}
