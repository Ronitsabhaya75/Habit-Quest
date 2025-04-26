import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import { getUserFromToken } from "../../../../lib/auth";
import Achievement from "../../../../models/Achievement";
import User from "../../../../models/User";
import Task from "../../../../models/Task";

export async function POST(request) {
  try {
    await connectToDatabase();
    
    // Get user from token
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    
    // Get updated user data with current XP and streak
    const userData = await User.findById(user._id);
    if (!userData) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    
    // Get request data
    const { 
      taskCompleted = false, 
      tasksCompletedToday = 0,
      updatedTaskId = null
    } = await request.json();
    
    // Find all achievements that haven't been unlocked by the user yet
    let allAchievements = await Achievement.find({});
    
    // Get user's already unlocked achievements
    const userAchievements = userData.achievements || [];
    const userAchievementIds = userAchievements.map(a => 
      a.achievementId ? a.achievementId.toString() : ''
    ).filter(id => id);
    
    // Filter to only achievements that haven't been unlocked yet
    const unlockedAchievements = [];
    
    // Check Task Champion achievement (complete 5 tasks in a day)
    const taskChampionAchievement = allAchievements.find(a => 
      a.name === "Task Champion" && !userAchievementIds.includes(a._id.toString())
    );
    
    if (taskChampionAchievement && tasksCompletedToday >= 5) {
      unlockedAchievements.push(taskChampionAchievement);
    }
    
    // Check Milestone 100 XP achievement
    const xpMilestoneAchievement = allAchievements.find(a => 
      a.name === "Milestone 100 XP" && !userAchievementIds.includes(a._id.toString())
    );
    
    if (xpMilestoneAchievement && userData.xp >= 100) {
      unlockedAchievements.push(xpMilestoneAchievement);
    }
    
    // Check First Week Streak achievement
    const streakAchievement = allAchievements.find(a => 
      a.name === "First Week Streak" && !userAchievementIds.includes(a._id.toString())
    );
    
    if (streakAchievement && userData.streak >= 7) {
      unlockedAchievements.push(streakAchievement);
    }
    
    // Check Habit Master achievement (completed 3 habits consistently)
    if (taskCompleted && updatedTaskId) {
      const habitMasterAchievement = allAchievements.find(a => 
        a.name === "Habit Master" && !userAchievementIds.includes(a._id.toString())
      );
      
      if (habitMasterAchievement) {
        // Count habits completed at least 3 times
        const completedTask = await Task.findById(updatedTaskId);
        
        if (completedTask && completedTask.isHabit) {
          // Check if user has completed 3 different habits
          const distinctHabitsCompleted = await Task.aggregate([
            { 
              $match: { 
                user: userData._id, 
                isHabit: true,
                completed: true
              } 
            },
            { 
              $group: { 
                _id: "$title",
                count: { $sum: 1 }
              } 
            },
            {
              $match: {
                count: { $gte: 3 }
              }
            }
          ]);
          
          if (distinctHabitsCompleted.length >= 3) {
            unlockedAchievements.push(habitMasterAchievement);
          }
        }
      }
    }
    
    // If user unlocked new achievements
    if (unlockedAchievements.length > 0) {
      // Calculate total XP reward
      const totalXpReward = unlockedAchievements.reduce((sum, achievement) => sum + (achievement.xpReward || 0), 0);
      
      // Add new achievements to user
      const achievementsToAdd = unlockedAchievements.map(achievement => ({
        achievementId: achievement._id,
        progress: 100,
        completed: true,
        completedAt: new Date()
      }));
      
      // Update user document
      await User.findByIdAndUpdate(user._id, {
        $push: { achievements: { $each: achievementsToAdd } },
        $inc: { xp: totalXpReward }
      });
      
      // Return the newly unlocked achievements
      return NextResponse.json({
        success: true,
        unlockedAchievements: unlockedAchievements.map(a => ({
          name: a.name,
          description: a.description,
          xpReward: a.xpReward || 50
        })),
        totalXpReward
      });
    }
    
    // If no new achievements were unlocked
    return NextResponse.json({
      success: true,
      unlockedAchievements: [],
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