import mongoose from "mongoose"

const BadgeSchema = new mongoose.Schema({
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
})

export default mongoose.models.Badge || mongoose.model("Badge", BadgeSchema)
