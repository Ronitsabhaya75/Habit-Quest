import { NextResponse } from "next/server";

const SPREADSHEET_ID = '1wPh65bKI6I5zeE1vqeCJTLHQoFhr7EUDlzPa3lXoj5A';
const SHEET_NAME = 'Sheet1';
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY;

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
    
    // Format data for Google Sheets
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.name,
      data.rating.toString(),
      data.usageFrequency || "",
      data.favoriteFeatures || "",
      data.improvements || "",
      data.recommendation || "",
      data.review || ""
    ];
    
    // Append data to Google Sheets
    const result = await appendToGoogleSheet(rowData);
    
    if (!result.success) {
      throw new Error(result.message || "Failed to submit review");
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

async function appendToGoogleSheet(rowData) {
  try {
    // Google Sheets API v4 endpoint for appending values
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${GOOGLE_API_KEY}`;
    
    // Prepare request body
    const body = {
      values: [rowData]
    };
    
    // Make API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }
    
    const responseData = await response.json();
    return {
      success: true,
      data: responseData
    };
    
  } catch (error) {
    console.error("Google Sheets API error:", error);
    return {
      success: false,
      message: error.message || "Failed to connect to Google Sheets"
    };
  }
} 