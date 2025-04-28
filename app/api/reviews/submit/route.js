import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Define the path for storing reviews locally
const REVIEWS_FILE_PATH = path.join(process.cwd(), 'data', 'reviews.json');

// Ensure the data directory exists
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Load existing reviews
function loadReviews() {
  try {
    ensureDirectoryExists(REVIEWS_FILE_PATH);
    if (!fs.existsSync(REVIEWS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(REVIEWS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading reviews:", error);
    return [];
  }
}

// Save reviews to file
function saveReviews(reviews) {
  try {
    ensureDirectoryExists(REVIEWS_FILE_PATH);
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(reviews, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error saving reviews:", error);
    return false;
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.rating || !data.review) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields"
      }, { status: 400 });
    }
    
    // Format data for storage
    const reviewData = {
      timestamp: data.timestamp || new Date().toISOString(),
      name: data.name,
      rating: data.rating.toString(),
      usageFrequency: data.usageFrequency || "",
      favoriteFeatures: data.favoriteFeatures || "",
      improvements: data.improvements || "",
      recommendation: data.recommendation || "",
      review: data.review || ""
    };
    
    // Load existing reviews
    const reviews = loadReviews();
    
    // Add new review
    reviews.push(reviewData);
    
    // Save updated reviews
    const saveResult = saveReviews(reviews);
    
    if (!saveResult) {
      throw new Error("Failed to save review to local storage");
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Review submitted successfully" 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error"
    }, { status: 500 });
  }
} 