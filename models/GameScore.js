import mongoose from "mongoose"

const GameScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  game: {
    type: String,
    required: [true, "Please provide a game name"],
    enum: ["chess", "pacman", "quiz", "spinwheel", "wordscrambler", "memory"],
  },
  score: {
    type: Number,
    required: [true, "Please provide a score"],
  },
  xpEarned: {
    type: Number,
    default: 0,
    max: 10, // Max XP per game is 10
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.GameScore || mongoose.model("GameScore", GameScoreSchema)
