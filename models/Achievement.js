/**
 * Achievement Schema for Mongoose
 * 
 * This schema defines the structure for Achievement documents in the MongoDB database.
 * Achievements are used to reward users based on specific criteria, such as completing tasks
 * or creating habits.
 * 
 * Fields:
 * 
 * 1. name: String
 *    - Required. Unique name for the achievement.
 * 
 * 2. description: String
 *    - Required. Description of what the achievement entails.
 * 
 * 3. xpReward: Number
 *    - Required. The amount of XP awarded upon achieving this milestone.
 * 
 * 4. criteria: String
 *    - Required. Specifies the criteria for earning the achievement.
 *    - Must be one of the following:
 *      - "tasks_completed"
 *      - "habits_created"
 *      - "streak_reached"
 *      - "games_played"
 *      - "fitness_plan_completed"
 * 
 * 5. threshold: Number
 *    - Required. The threshold value that must be met to achieve this award.
 * 
 * 6. createdAt: Date
 *    - Defaults to the current date and time when the achievement is created.
 */
import mongoose from "mongoose"

const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide an achievement name"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide an achievement description"],
    trim: true,
  },
  xpReward: {
    type: Number,
    required: [true, "Please provide an XP reward"],
  },
  criteria: {
    type: String,
    enum: ["tasks_completed", "habits_created", "streak_reached", "games_played", "fitness_plan_completed"],
    required: [true, "Please provide achievement criteria"],
  },
  threshold: {
    type: Number,
    required: [true, "Please provide a threshold value"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Achievement || mongoose.model("Achievement", AchievementSchema)
