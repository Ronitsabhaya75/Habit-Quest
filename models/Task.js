import mongoose from "mongoose"

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
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
      required: [true, "Due date is required"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    xpReward: {
      type: Number,
      default: 10,
      min: [1, "XP reward must be at least 1"],
    },
    isHabit: {
      type: Boolean,
      default: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly"],
      required: function() {
        return this.isRecurring;
      }
    },
    recurringEndDate: {
      type: Date,
      default: null,
    },
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  },
  {
    timestamps: true,
  }
)

// Static method to calculate the next due date for recurring tasks
TaskSchema.statics.getNextDueDate = function(currentDate, frequency) {
  const date = new Date(currentDate)
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'biweekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    default:
      date.setDate(date.getDate() + 1) // Default to daily
  }
  
  return date
}

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)
