/**
 * Game Score Schema for Mongoose
 * 
 * This schema defines the structure for GameScore documents in the MongoDB database.
 * It tracks the scores of users in various games, along with relevant information
 * such as the user, game type, score achieved, and experience points earned.
 * 
 * Fields:
 * 
 * 1. user: ObjectId
 *    - Required. References the User document associated with the game score.
 * 
 * 2. game: String
 *    - Required. The name of the game for which the score is recorded.
 *    - Must be one of the following:
 *      - "chess"
 *      - "pacman"
 *      - "quiz"
 *      - "spinwheel"
 *      - "habit-challenge"
 *      - "wordscrambler"
 *      - "memory"
 * 
 * 3. score: Number
 *    - Required. The score achieved by the user in the specified game.
 * 
 * 4. xpEarned: Number
 *    - The amount of experience points earned from the game.
 *    - Defaults to 0 and has a maximum value of 10 (max XP per game).
 * 
 * 5. playedAt: Date
 *    - The timestamp of when the game was played.
 *    - Defaults to the current date and time when the score is recorded.
 */
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
    enum: ["chess", "pacman", "quiz", "spinwheel", "habit-challenge", "wordscrambler", "memory"],
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
