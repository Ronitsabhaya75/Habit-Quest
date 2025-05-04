import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { getUserFromToken } from "../../../../lib/auth";

/**
 * GET /api/user/me
 * Retrieves the current user's data with a focus on streak information
 */
export async function GET(request) {
  try {
    // Get user from token
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Get the latest user data to ensure we have current streak info
    const userData = await User.findById(user._id)
      .select("username xp level streak lastActive")
      .lean();

    if (!userData) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Format the date for easier frontend display
    if (userData.lastActive) {
      userData.lastActiveFormatted = new Date(userData.lastActive)
        .toISOString()
        .split("T")[0];
    }

    // Calculate days until streak is lost (24 hours from last activity)
    const lastActive = new Date(userData.lastActive || Date.now());
    const now = new Date();
    const timeDiff = 24 * 60 * 60 * 1000 - (now.getTime() - lastActive.getTime());
    const hoursLeft = Math.max(0, Math.floor(timeDiff / (60 * 60 * 1000)));
    
    userData.streakExpiresIn = {
      hours: hoursLeft,
      timestamp: new Date(lastActive.getTime() + 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json(
      { success: true, data: userData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
} 