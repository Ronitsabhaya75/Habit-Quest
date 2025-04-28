/**
 * Task Schema for Mongoose
 * 
 * This schema defines the structure for Task documents in the MongoDB database.
 * Tasks can be linked to users and can represent both standard tasks and habits.
 * 
 * Fields:
 * 
 * 1. user: ObjectId
 *    - Required. References the User document associated with the task.
 * 
 * 2. title: String
 *    - Required. The title of the task.
 *    - Must be trimmed and cannot exceed 100 characters.
 * 
 * 3. description: String
 *    - A description of the task.
 *    - Can be trimmed and cannot exceed 500 characters.
 * 
 * 4. dueDate: Date
 *    - Required. The date by which the task must be completed.
 * 
 * 5. dueDateString: String
 *    - A string representation of the due date in YYYY-MM-DD format for easier filtering.
 * 
 * 6. completed: Boolean
 *    - Indicates whether the task has been completed.
 *    - Defaults to false.
 * 
 * 7. completedAt: Date
 *    - The date when the task was completed.
 *    - Defaults to null.
 * 
 * 8. xpReward: Number
 *    - The amount of experience points awarded for completing the task.
 *    - Defaults to 10 and must be at least 1.
 * 
 * 9. isHabit: Boolean
 *    - Indicates whether the task is a habit.
 *    - Defaults to false.
 * 
 * 10. habitId: String
 *     - Links to a habit if this task was created from a habit.
 *     - Defaults to null.
 * 
 * 11. isRecurring: Boolean
 *     - Indicates whether the task is recurring.
 *     - Defaults to false.
 * 
 * 12. frequency: String
 *     - Specifies the frequency of the task if it is recurring.
 *     - Must be one of: "daily", "weekly", "biweekly", "monthly".
 *     - Required only if isRecurring is true.
 * 
 * 13. recurringEndDate: Date
 *     - The date when the recurring task ends.
 *     - Defaults to null.
 * 
 * 14. parentTaskId: ObjectId
 *     - References another Task document if this task is a subtask.
 * 
 * 15. createdAt: Date
 *     - The timestamp of when the task was created.
 *     - Automatically managed by Mongoose.
 * 
 * Static Methods:
 * 
 * 1. getNextDueDate(currentDate, frequency)
 *    - Calculates the next due date for recurring tasks based on the current date and frequency.
 * 
 * 2. createHabitTask(habitData, userId)
 *    - Creates a task based on a habit for the specified user, ensuring that a task for today does not already exist.
 * 
 * Pre-save Middleware:
 * - Ensures dueDateString is normalized to YYYY-MM-DD format before saving.
 */
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
    },
    gameRelated: {  // New field to track game association
      type: String,
      enum: ['spinWheel', 'quizGame', 'wordScrambler', null],
      default: null
    }
  },
  {
    timestamps: true,
  }
)

// Static method to calculate next due date (unchanged)
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
      date.setDate(date.getDate() + 1)
  }
  
  return date
}

// Enhanced pre-save hook with game XP tracking
TaskSchema.pre('save', async function(next) {
  // Existing dueDateString logic
  if (this.dueDate) {
    const date = new Date(this.dueDate)
    date.setHours(0, 0, 0, 0)
    this.dueDate = date
    this.dueDateString = date.toISOString().split('T')[0]
  }

  // New: Handle XP reward when task is completed
  if (this.isModified('completed') && this.completed) {
    this.completedAt = new Date()
    
    try {
      const User = mongoose.model('User')
      await User.findByIdAndUpdate(this.user, {
        $inc: { xp: this.xpReward },
        $set: { lastActive: new Date() }
      })

      // Update game stats if this is a game-related task
      if (this.gameRelated) {
        await User.findByIdAndUpdate(this.user, {
          $inc: { [`gameStats.${this.gameRelated}.totalXP`]: this.xpReward }
        })
      }
    } catch (error) {
      console.error('Error updating user XP:', error)
    }
  }

  next()
})

// Static method to create game-related tasks
TaskSchema.statics.createGameTask = async function(userId, gameType, taskData) {
  const task = new this({
    user: userId,
    title: taskData.title || `Game: ${gameType}`,
    description: taskData.description || `Complete ${gameType} challenge`,
    dueDate: taskData.dueDate || new Date(),
    xpReward: taskData.xpReward || 15,
    gameRelated: gameType,
    ...taskData
  })

  await task.save()
  return task
}

// Existing createHabitTask method (unchanged)
TaskSchema.statics.createHabitTask = async function(habitData, userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]
  
  const existingTask = await this.findOne({
    user: userId,
    isHabit: true,
    habitId: habitData.id,
    dueDateString: todayStr
  })
  
  if (existingTask) return existingTask
  
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
  return newTask
}

export default mongoose.models.Task || mongoose.model("Task", TaskSchema)

