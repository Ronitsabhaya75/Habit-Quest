import mongoose from "mongoose"

const HabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a habit name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  startDate: {
    type: Date,
    required: [true, "Please provide a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide an end date"],
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "biweekly"],
    default: "daily",
  },
  reminder: {
    type: Boolean,
    default: true,
  },
  xpReward: {
    type: Number,
    default: 30,
  },
  progress: [
    {
      date: Date,
      completed: Boolean,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Habit || mongoose.model("Habit", HabitSchema)
