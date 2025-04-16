import mongoose from "mongoose"

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please provide a task title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  dueDate: {
    type: Date,
    required: [true, "Please provide a due date"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  xpReward: {
    type: Number,
    default: 20,
  },
  isHabit: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)
