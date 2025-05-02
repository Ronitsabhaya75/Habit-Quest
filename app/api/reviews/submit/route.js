import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Define the path for storing reviews locally
const REVIEWS_FILE_PATH = path.join(process.cwd(), 'data', 'reviews.json');

// Ensure the data directory exists
function ensureDirectoryExists(filePath) {
  try {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error("Error ensuring directory exists:", error);
    return false;
  }
}

// Load existing reviews
function loadReviews() {
  try {
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
    fs.writeFileSync(REVIEWS_FILE_PATH, JSON.stringify(reviews, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error("Error saving reviews:", error);
    return false;
  }
}

export async function POST(request) {
  try {
    // Parse the incoming JSON request
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      console.error("Failed to parse JSON request:", parseError);
      return NextResponse.json({ 
        success: false, 
        message: "Invalid request format. Please send a valid JSON body."
      }, { status: 400 });
    }
    
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
    
    // Log the review data
    console.log("Review received:", reviewData);
    
    // Try to save to local file system (this will work in development but may fail in production)
    try {
      // Ensure the directory exists
      if (ensureDirectoryExists(REVIEWS_FILE_PATH)) {
        // Load existing reviews
        const reviews = loadReviews();
        
        // Add new review
        reviews.push(reviewData);
        
        // Save updated reviews
        saveReviews(reviews);
      }
    } catch (fileError) {
      // Just log the error but don't fail the request
      console.error("Could not save review to file system:", fileError);
      // This is expected in production environments with read-only file systems
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: "Review submitted successfully" 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to process your review. Please try again."
    }, { status: 500 });
  }
} 