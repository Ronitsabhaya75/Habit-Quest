/**
 * Badge Schema for Mongoose
 * 
 * This schema defines the structure for Badge documents in the MongoDB database.
 * Badges are awarded to users for various achievements or milestones and can have
 * different properties such as rarity and price.
 * 
 * Fields:
 * 
 * 1. numericId: Number
 *    - Unique identifier for the badge, allowing null/undefined values for backward compatibility.
 * 
 * 2. name: String
 *    - Required. Unique name for the badge.
 * 
 * 3. description: String
 *    - Required. Description of what the badge represents.
 * 
 * 4. price: Number
 *    - Required. The cost of the badge, potentially in an in-game currency.
 * 
 * 5. rarity: String
 *    - Specifies the rarity of the badge.
 *    - Can be one of the following: "common", "rare", "epic".
 *    - Defaults to "common".
 * 
 * 6. icon: String
 *    - Represents the badge visually (default is a trophy emoji).
 * 
 * 7. createdAt: Date
 *    - Defaults to the current date and time when the badge is created.
 * 
 * Options:
 * - The schema is set to be less strict to allow for future field additions without breaking changes.
 */
import mongoose from "mongoose"

// Clear existing model if it exists to ensure schema updates are applied
mongoose.models = {}

const BadgeSchema = new mongoose.Schema({
  numericId: {
    type: Number,
    unique: true,
    sparse: true, // This allows null/undefined values (for backward compatibility)
  },
  name: {
    type: String,
    required: [true, "Please provide a badge name"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a badge description"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please provide a badge price"],
  },
  rarity: {
    type: String,
    enum: ["common", "rare", "epic"],
    default: "common",
  },
  icon: {
    type: String,
    default: "🏆",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  // Make the schema less strict to accommodate field additions
  strict: false 
})

// Check if model already exists before creating
export default mongoose.models.Badge || mongoose.model("Badge", BadgeSchema)
