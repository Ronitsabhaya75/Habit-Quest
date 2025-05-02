import { NextResponse } from "next/server";

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
    
    // In a production environment, we would store this in a database
    // For now, we'll just return success since we can't write to filesystem in production
    
    console.log("Review received:", reviewData);
    
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