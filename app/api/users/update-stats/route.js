import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

export async function POST(request) {
  try {
    // Validate and parse the request body
    const body = await request.json();
    const { gameType, xpEarned, stats } = body;

    // Validate required fields
    if (!gameType || !xpEarned) {
      return NextResponse.json(
        { success: false, message: "Game type and XP earned are required" },
        { status: 400 }
      );
    }

    // Validate game type
    const validGameTypes = ["spinWheel", "quizGame", "wordScrambler"];
    if (!validGameTypes.includes(gameType)) {
      return NextResponse.json(
        { success: false, message: "Invalid game type" },
        { status: 400 }
      );
    }

    // Get the authenticated user using getUserFromToken
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Prepare additional stats based on game type
    const additionalStats = {};
    
    switch (gameType) {
      case "spinWheel":
        additionalStats.plays = 1;
        break;
      case "quizGame":
        additionalStats.correct = stats?.correct || false;
        additionalStats.roundCompleted = stats?.roundCompleted || false;
        break;
      case "wordScrambler":
        additionalStats.mode = stats?.mode || "scrambled";
        break;
    }

    // Add XP and update game-specific stats
    user.addXP(xpEarned, gameType, additionalStats);
    
    // Update user's last active time and streak
    user.updateStreak();
    
    // Save the updated user
    await user.save();

    // Return success response with updated user stats
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${gameType} stats and added ${xpEarned} XP`,
      data: {
        xp: user.xp,
        level: user.level,
        gameStats: user.gameStats[gameType]
      }
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user stats" },
      { status: 500 }
    );
  }
}

// Fallback for other HTTP methods to prevent 405 errors
export async function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed. Please use POST." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: "Method not allowed. Please use POST." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: "Method not allowed. Please use POST." },
    { status: 405 }
  );
}