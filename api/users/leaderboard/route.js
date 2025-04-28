import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export const dynamic = 'force-dynamic'; // Ensure this route is dynamic on Vercel

export async function GET() {
  try {
    await connectDB();
    
    const leaderboard = await User.find({})
      .sort({ xp: -1 })
      .limit(10)
      .select('username xp level gameStats lastActive')
      .lean();

    // Add rank and badge to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
      badge: getBadgeForUser(user.xp, index),
      isCurrentUser: false // You'll set this based on auth later
    }));

    return NextResponse.json({ 
      success: true, 
      data: rankedLeaderboard 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function getBadgeForUser(xp, rank) {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  if (xp >= 500) return "🌟";
  if (xp >= 400) return "🚀";
  if (xp >= 300) return "🌙";
  if (xp >= 200) return "✨";
  return "🔭";
}
