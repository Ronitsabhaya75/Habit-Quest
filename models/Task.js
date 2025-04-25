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
    dueDateString: {
      type: String,
      // This will be in YYYY-MM-DD format
      // Used for easier date filtering
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
    // New field to link to the habit if this task was created from a habit
    habitId: {
      type: String,
      default: null,
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

// Pre-save middleware to ensure dueDateString is set
TaskSchema.pre('save', function(next) {
  if (this.dueDate) {
    const date = new Date(this.dueDate)
    // Ensure date is normalized
    date.setHours(0, 0, 0, 0)
    // Update the dueDate to be normalized
    this.dueDate = date
    this.dueDateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
    
    console.log(`Pre-save: Setting dueDateString to ${this.dueDateString} for task ${this.title}`)
  }
  next()
})

// Create a static method to create or update habit tasks
TaskSchema.statics.createHabitTask = async function(habitData, userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Ensure we format the date string consistently as YYYY-MM-DD
  const todayStr = today.toISOString().split('T')[0]
  
  console.log("Creating habit task for date:", todayStr)
  
  // Check if a task for this habit already exists today
  const existingTask = await this.findOne({
    user: userId,
    isHabit: true,
    habitId: habitData.id,
    dueDateString: todayStr
  })
  
  if (existingTask) {
    console.log("Habit task already exists for today:", existingTask._id)
    return existingTask // Task already exists
  }
  
  // Create a new task for today's habit
  const newTask = new this({
    title: `${habitData.name || 'Daily Habit'} 💪`,
    description: habitData.description || 'Complete your daily habit',
    dueDate: today,
    dueDateString: todayStr,
    user: userId,
    completed: false,
    completedAt: null,
    xpReward: habitData.xpReward || 30,
    isHabit: true,
    habitId: habitData.id,
    isRecurring: true,
    frequency: habitData.frequency || 'daily',
    recurringEndDate: habitData.endDate
  })
  
  await newTask.save()
  console.log("Created new habit task with ID:", newTask._id)
  return newTask
}

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)
