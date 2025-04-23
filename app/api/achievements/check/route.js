import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import { getUserFromToken } from "../../../../lib/auth";
import Achievement from "../../../../models/Achievement";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Get task count from request
    const { tasksCompleted } = await request.json();
    
    if (typeof tasksCompleted !== 'number') {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid tasks completed count" 
      }, { status: 400 });
    }
    
    // Get all achievement criteria for task completion
    const achievements = await Achievement.find({ 
      criteria: "tasks_completed",
      threshold: { $lte: tasksCompleted } // Achievements with thresholds less than or equal to completion count
    });
    
    // Get user's already unlocked achievements
    const userAchievements = user.achievements || [];
    const userAchievementIds = userAchievements.map(a => a.achievementId.toString());
    
    // Filter to only new achievements
    const newAchievements = achievements.filter(achievement => 
      !userAchievementIds.includes(achievement._id.toString())
    );
    
    // If user unlocked new achievements
    if (newAchievements.length > 0) {
      // Calculate total XP reward
      const totalXpReward = newAchievements.reduce((sum, achievement) => sum + achievement.xpReward, 0);
      
      // Add new achievements to user
      const achievementsToAdd = newAchievements.map(achievement => ({
        achievementId: achievement._id,
        name: achievement.name,
        unlockedAt: new Date()
      }));
      
      // Update user document
      await User.findByIdAndUpdate(user._id, {
        $push: { achievements: { $each: achievementsToAdd } },
        $inc: { xp: totalXpReward }
      });
      
      // Return the newly unlocked achievements
      return NextResponse.json({
        success: true,
        newAchievements: newAchievements.map(a => ({
          name: a.name,
          description: a.description,
          xpReward: a.xpReward
        })),
        totalXpReward
      });
    }
    
    // If no new achievements were unlocked
    return NextResponse.json({
      success: true,
      newAchievements: [],
      totalXpReward: 0
    });
    
  } catch (error) {
    console.error("Achievement check error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error" 
    }, { status: 500 });
  }
} 