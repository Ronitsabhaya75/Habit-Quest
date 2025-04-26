import connectToDatabase from './mongodb';
import Achievement from '../models/Achievement';

export async function seedAchievements() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Default achievements
    const defaultAchievements = [
      {
        name: "First Week Streak",
        description: "Completed 7 days of habits",
        xpReward: 100,
        criteria: "streak_reached",
        threshold: 7
      },
      {
        name: "Milestone 100 XP",
        description: "Reached 100 XP points",
        xpReward: 50,
        criteria: "tasks_completed",
        threshold: 10
      },
      {
        name: "Habit Master",
        description: "Completed 3 habits consistently",
        xpReward: 150,
        criteria: "habits_created",
        threshold: 3
      },
      {
        name: "Task Champion",
        description: "Completed 5 tasks in a day",
        xpReward: 100,
        criteria: "tasks_completed",
        threshold: 5
      },
      {
        name: "Early Bird",
        description: "Complete tasks before 9am",
        xpReward: 75,
        criteria: "tasks_completed",
        threshold: 3
      }
    ];
    
    // For each default achievement, check if it exists
    for (const achievement of defaultAchievements) {
      const existingAchievement = await Achievement.findOne({ name: achievement.name });
      
      if (!existingAchievement) {
        // Create the achievement if it doesn't exist
        await Achievement.create(achievement);
        console.log(`Created achievement: ${achievement.name}`);
      }
    }
    
    console.log('Achievement seeding complete');
    return true;
  } catch (error) {
    console.error('Error seeding achievements:', error);
    return false;
  }
}

// Call this function from an API route or at app initialization 