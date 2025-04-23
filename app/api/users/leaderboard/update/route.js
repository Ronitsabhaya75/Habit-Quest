import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/mongodb";
import { getUserFromToken } from "../../../../../lib/auth";
import User from "../../../../../models/User";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Get XP amount from request
    const { xpGained, source } = await request.json();
    
    if (typeof xpGained !== 'number' || xpGained <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid XP amount" 
      }, { status: 400 });
    }
    
    // Update user's XP
    const updatedUser = await User.findByIdAndUpdate(
      user._id, 
      { 
        $inc: { xp: xpGained },
        $push: { 
          xpHistory: {
            amount: xpGained,
            source: source || "task_completion",
            timestamp: new Date()
          } 
        }
      },
      { new: true }
    );
    
    // Calculate user's new level based on XP
    const level = Math.floor(updatedUser.xp / 100) + 1;
    
    // Get user's new rank on leaderboard
    const leaderboardPosition = await User.countDocuments({ xp: { $gt: updatedUser.xp } }) + 1;
    
    return NextResponse.json({
      success: true,
      data: {
        xp: updatedUser.xp,
        level,
        leaderboardPosition
      }
    });
    
  } catch (error) {
    console.error("Leaderboard update error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error" 
    }, { status: 500 });
  }
} 