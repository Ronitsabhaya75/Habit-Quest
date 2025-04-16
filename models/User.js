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
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add a method to calculate level based on XP
UserSchema.methods.calculateLevel = function () {
  // Simple level calculation: level = 1 + floor(xp / 100)
  this.level = 1 + Math.floor(this.xp / 100)
  return this.level
}

// Add XP and update level
UserSchema.methods.addXP = function (amount) {
  this.xp += amount
  this.calculateLevel()
  return this.xp
}

// Update streak
UserSchema.methods.updateStreak = function () {
  const today = new Date()
  const lastActive = this.lastActive

  // Check if last active was yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (lastActive.toDateString() === yesterday.toDateString()) {
    this.streak += 1
  } else if (lastActive.toDateString() !== today.toDateString()) {
    // Reset streak if not active yesterday and not already active today
    this.streak = 1
  }

  this.lastActive = today
  return this.streak
}

// This pattern prevents model recompilation errors during development
const User = mongoose.models.User || mongoose.model("User", UserSchema)

export default User
