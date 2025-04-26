// Script to add more badges to the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Badge from '../models/Badge.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// New badges to add
const newBadges = [
  {
    name: "Productivity Master",
    description: "For those who consistently achieve their goals and maintain high productivity.",
    price: 150,
    rarity: "rare",
    icon: "⚡"
  },
  {
    name: "Consistency Champion",
    description: "Awarded to users who maintain long streaks and show unwavering commitment.",
    price: 200,
    rarity: "rare",
    icon: "🔄"
  },
  {
    name: "Mindfulness Guru",
    description: "For users who prioritize mental well-being and mindfulness practices.",
    price: 120,
    rarity: "common",
    icon: "🧘"
  },
  {
    name: "Fitness Enthusiast",
    description: "Celebrates dedication to physical health and regular exercise.",
    price: 130,
    rarity: "common",
    icon: "🏋️"
  },
  {
    name: "Early Bird",
    description: "For those who consistently rise early and make the most of morning hours.",
    price: 140,
    rarity: "common",
    icon: "🌅"
  },
  {
    name: "Night Owl",
    description: "Recognizes productivity during late hours when others are asleep.",
    price: 140,
    rarity: "common",
    icon: "🌙"
  },
  {
    name: "Reading Aficionado",
    description: "For those who cultivate their mind through regular reading.",
    price: 130,
    rarity: "common",
    icon: "📚"
  },
  {
    name: "Digital Detox",
    description: "Awarded to users who successfully limit screen time and practice digital wellness.",
    price: 170,
    rarity: "rare",
    icon: "📵"
  },
  {
    name: "Super Achiever",
    description: "For users who consistently go above and beyond their goals.",
    price: 250,
    rarity: "epic",
    icon: "🌟"
  },
  {
    name: "Zen Master",
    description: "The highest level of mindfulness and mental clarity.",
    price: 300,
    rarity: "epic",
    icon: "☯️"
  },
  {
    name: "Diamond Discipline",
    description: "For those with unbreakable discipline and consistency.",
    price: 350,
    rarity: "epic",
    icon: "💎"
  }
];

// Function to add badges
async function addBadges() {
  try {
    // Check for existing badges to avoid duplicates
    for (const badge of newBadges) {
      const exists = await Badge.findOne({ name: badge.name });
      if (!exists) {
        await Badge.create(badge);
        console.log(`Added badge: ${badge.name}`);
      } else {
        console.log(`Badge already exists: ${badge.name}`);
      }
    }
    
    console.log('Badge seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error adding badges:', error);
    process.exit(1);
  }
}

// Run the function
addBadges(); 