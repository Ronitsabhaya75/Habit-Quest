import { NextResponse } from "next/server";
import { seedAchievements } from "../../../../lib/seed-achievements";
import { getUserFromToken } from "../../../../lib/auth";

export async function GET(request) {
  try {
    // Only allow admin users or in development
    const user = await getUserFromToken(request);
    const isAdmin = user && user.role === 'admin';
    const isDev = process.env.NODE_ENV === 'development';
    
    if (!isAdmin && !isDev) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Seed achievements
    const success = await seedAchievements();
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: "Achievements initialized successfully" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to initialize achievements" 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Achievement initialization error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error" 
    }, { status: 500 });
  }
} 