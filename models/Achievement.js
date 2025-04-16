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
