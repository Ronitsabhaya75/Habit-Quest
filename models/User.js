/**
 * User Schema for Mongoose
 * 
 * This schema defines the structure for User documents in the MongoDB database.
 * Users can have various properties including a username, email, password, and 
 * attributes related to experience points, levels, streaks, and achievements.
 * 
 * Fields:
 * 
 * 1. username: String
 *    - Required. Unique username for the user.
 *    - Must be trimmed and cannot exceed 20 characters.
 * 
 * 2. email: String
 *    - Required. Unique email address for the user.
 *    - Must match a valid email format.
 * 
 * 3. password: String
 *    - Required. User's password.
 *    - Must be at least 6 characters long.
 * 
 * 4. xp: Number
 *    - The total experience points earned by the user.
 *    - Defaults to 0.
 * 
 * 5. level: Number
 *    - User's current level based on XP.
 *    - Defaults to 1.
 * 
 * 6. streak: Number
 *    - Current streak of active days.
 *    - Defaults to 0.
 * 
 * 7. lastActive: Date
 *    - Timestamp of the last time the user was active.
 *    - Defaults to the current date and time.
 * 
 * 8. badges: Array
 *    - An array of references to Badge documents awarded to the user.
 * 
 * 9. achievements: Array
 *    - An array of objects tracking the user's achievements.
 *    - Each object contains:
 *      - achievementId: ObjectId - Reference to the Achievement document.
 *      - progress: Number - Current progress towards the achievement.
 *      - completed: Boolean - Indicates whether the achievement is completed.
 *      - completedAt: Date - Timestamp of when the achievement was completed.
 * 
 * 10. fitnessProfile: Object
 *     - Contains fitness-related information:
 *       - weight: Number
 *       - height: Number
 *       - age: Number
 *       - gender: String
 *       - activityLevel: String
 *       - fitnessGoal: String
 * 
 * 11. createdAt: Date
 *     - The timestamp of when the user was created.
 *     - Defaults to the current date and time.
 * 
 * Instance Methods:
 * 
 * 1. calculateLevel()
 *    - Calculates the user's level based on their experience points (XP).
 * 
 * 2. addXP(amount)
 *    - Adds XP to the user and updates their level accordingly.
 * 
 * 3. updateStreak()
 *    - Updates the user's streak based on their last active date.
 */
import mongoose from "mongoose"

// Check if the User model already exists to prevent overwriting it
// This is important for hot reloading in development
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
    trim: true,
    maxlength: [20, "Username cannot be more than 20 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  badges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
    },
  ],
  achievements: [
    {
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
      progress: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
    },
  ],
  fitnessProfile: {
    weight: Number,
    height: Number,
    age: Number,
    gender: String,
    activityLevel: String,
    fitnessGoal: String,
  },
  gameStats: {  // New field for tracking game statistics
    spinWheel: {
      totalXP: { type: Number, default: 0 },
      plays: { type: Number, default: 0 },
    },
    quizGame: {
      totalXP: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      roundsCompleted: { type: Number, default: 0 },
    },
    wordScrambler: {
      totalXP: { type: Number, default: 0 },
      correctWords: { type: Number, default: 0 },
      modes: {
        scrambled: { type: Number, default: 0 },
        missing: { type: Number, default: 0 },
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Calculate level based on XP (unchanged)
UserSchema.methods.calculateLevel = function () {
  this.level = 1 + Math.floor(this.xp / 100)
  return this.level
}

// Enhanced addXP method with game tracking
UserSchema.methods.addXP = function (amount, gameType, additionalStats = {}) {
  this.xp += amount
  this.calculateLevel()
  
  // Update game-specific stats if provided
  if (gameType && this.gameStats) {
    switch (gameType) {
      case 'spinWheel':
        this.gameStats.spinWheel.totalXP += amount
        this.gameStats.spinWheel.plays += additionalStats.plays || 1
        break
      case 'quizGame':
        this.gameStats.quizGame.totalXP += amount
        if (additionalStats.correct) this.gameStats.quizGame.correctAnswers += 1
        if (additionalStats.roundCompleted) this.gameStats.quizGame.roundsCompleted += 1
        break
      case 'wordScrambler':
        this.gameStats.wordScrambler.totalXP += amount
        this.gameStats.wordScrambler.correctWords += 1
        if (additionalStats.mode) {
          this.gameStats.wordScrambler.modes[additionalStats.mode] += 1
        }
        break
    }
  }
  
  return this.xp
}

// Unchanged streak update method
UserSchema.methods.updateStreak = function () {
  const today = new Date()
  const lastActive = this.lastActive
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (lastActive.toDateString() === yesterday.toDateString()) {
    this.streak += 1
  } else if (lastActive.toDateString() !== today.toDateString()) {
    this.streak = 1
  }

  this.lastActive = today
  return this.streak
}

// Add static method for leaderboard
UserSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({})
    .sort({ xp: -1 })
    .limit(limit)
    .select('username xp level gameStats lastActive')
    .lean()
}

const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User
