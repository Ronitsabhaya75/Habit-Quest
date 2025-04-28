import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { getSession } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const session = await getSession();
    const body = await req.json();
    
    if (!session?.user?._id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { xp = 0, gameType, correct, roundCompleted, mode } = body;
    
    const updateObj = {
      $inc: { xp },
      $set: { lastActive: new Date() }
    };

    // Game-specific updates
    if (gameType) {
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc[`gameStats.${gameType}.totalXP`] = xp;

      if (gameType === 'quizGame') {
        if (correct) updateObj.$inc['gameStats.quizGame.correctAnswers'] = 1;
        if (roundCompleted) updateObj.$inc['gameStats.quizGame.roundsCompleted'] = 1;
      } else if (gameType === 'wordScrambler' && mode) {
        updateObj.$inc[`gameStats.wordScrambler.modes.${mode}`] = 1;
      } else if (gameType === 'spinWheel') {
        updateObj.$inc['gameStats.spinWheel.plays'] = 1;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user._id,
      updateObj,
      { new: true }
    ).select('xp level gameStats');

    return NextResponse.json({
      success: true,
      data: {
        xp: updatedUser.xp,
        level: updatedUser.level,
        gameStats: updatedUser.gameStats
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
