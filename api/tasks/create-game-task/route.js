import { NextResponse } from "next/server";
import Task from "@/models/Task";
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

    const { gameType, title, description, xpReward, dueDate } = body;

    if (!gameType || !title) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newTask = await Task.create({
      user: session.user._id,
      title,
      description: description || `Complete ${gameType} challenge`,
      dueDate: dueDate || new Date(Date.now() + 86400000 * 3), // Default: 3 days from now
      xpReward: xpReward || 15,
      gameRelated: gameType
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newTask._id,
        title: newTask.title,
        dueDate: newTask.dueDate,
        xpReward: newTask.xpReward
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
