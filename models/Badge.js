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
