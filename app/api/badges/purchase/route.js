import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import Badge from "../../../../models/Badge"
import User from "../../../../models/User"
import { getUserFromToken } from "../../../../lib/auth"

// Purchase a badge
export async function POST(request) {
  try {
    console.log("Starting badge purchase process");
    
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      console.log("User not authenticated");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get badge ID and log it
    const requestData = await request.json()
    const { badgeId } = requestData
    console.log("Badge purchase request:", JSON.stringify(requestData));

    if (!badgeId) {
      console.log("No badgeId provided");
      return NextResponse.json({ success: false, message: "Badge ID is required" }, { status: 400 })
    }

    // Get badge - check if the badgeId is a number to handle frontend numeric IDs
    let badge
    const numericBadgeId = parseInt(badgeId)
    
    console.log(`Attempting to find badge with ID: ${badgeId}, numericId: ${numericBadgeId}`);

    // Try both numeric ID and name-based lookup to be more resilient
    if (!isNaN(numericBadgeId)) {
      // First try by numeric ID
      badge = await Badge.findOne({ numericId: numericBadgeId })
      
      // If badge doesn't exist, try to create it
      if (!badge) {
        console.log(`Badge not found by numericId ${numericBadgeId}, attempting to create it`);
        
        // Get name based on common badge names
        const badgeName = getBadgeName(numericBadgeId);
        
        // Try by name if numeric ID fails
        badge = await Badge.findOne({ name: badgeName });
        
        // If still not found, create a new badge
        if (!badge) {
          console.log(`Creating new badge with name: ${badgeName}`);
          try {
            badge = new Badge({
              numericId: numericBadgeId,
              name: badgeName,
              description: getBadgeDescription(numericBadgeId),
              price: getBadgePrice(numericBadgeId),
              rarity: getBadgeRarity(numericBadgeId),
              criteria: "purchase",
              threshold: 1
            })
            
            await badge.save()
            console.log(`Badge created successfully with ID: ${badge._id}`);
          } catch (error) {
            console.error("Error creating badge:", error)
            return NextResponse.json({ 
              success: false, 
              message: "Failed to create badge", 
              error: error.message
            }, { status: 500 })
          }
        } else {
          console.log(`Found badge by name: ${badgeName}, ID: ${badge._id}`);
        }
      } else {
        console.log(`Found badge by numericId: ${numericBadgeId}, ID: ${badge._id}`);
      }
    } else {
      // If it's not a number, assume it's a valid MongoDB ID
      try {
        badge = await Badge.findById(badgeId)
        console.log(`Found badge by MongoDB ID: ${badgeId}`);
      } catch (error) {
        console.error("Error finding badge by ID:", error);
        
        // Try by name as a fallback
        const possibleName = String(badgeId).replace(/[0-9]/g, '').trim();
        if (possibleName) {
          badge = await Badge.findOne({ 
            name: { $regex: new RegExp(possibleName, 'i') } 
          });
          
          if (badge) {
            console.log(`Found badge by name regex: ${possibleName}, ID: ${badge._id}`);
          }
        }
      }
    }

    if (!badge) {
      console.log("Badge not found after all attempts");
      return NextResponse.json({ success: false, message: "Badge not found" }, { status: 404 })
    }

    // Get user with badges
    const userObj = await User.findById(user._id)

    // Check if user already has this badge (compare badge ID strings)
    const badgeExists = userObj.badges.some(b => {
      // Convert both to strings for proper comparison
      const userBadgeId = b.toString();
      const currentBadgeId = badge._id.toString();
      
      // Log the comparison for debugging
      console.log(`Comparing user badge: ${userBadgeId} with current badge: ${currentBadgeId}`);
      
      return userBadgeId === currentBadgeId;
    });
    
    if (badgeExists) {
      console.log("User already owns this badge");
      return NextResponse.json({ 
        success: true, 
        message: "You already own this badge", 
        data: {
          badge,
          userXp: userObj.xp,
          alreadyOwned: true
        }
      }, { status: 200 })
    }

    // Check if user has enough XP
    if (userObj.xp < badge.price) {
      console.log(`Insufficient XP. User has: ${userObj.xp}, Badge costs: ${badge.price}`);
      return NextResponse.json({ success: false, message: "Not enough XP" }, { status: 400 })
    }

    console.log(`Processing purchase: Badge ${badge.name}, Cost: ${badge.price} XP`);
    
    // Deduct XP and add badge
    userObj.xp -= badge.price
    userObj.badges.push(badge._id)
    await userObj.save()
    
    console.log(`Badge purchased successfully. User's new XP: ${userObj.xp}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          badge,
          userXp: userObj.xp,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Purchase badge error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 })
  }
}

// Helper functions to get badge data based on numeric ID
function getBadgeName(id) {
  const names = {
    1: "Early Bird",
    2: "Night Owl",
    3: "Streak Master",
    4: "Game Champion",
    5: "Fitness Guru",
    6: "Habit Hero"
  }
  return names[id] || `Badge ${id}`
}

function getBadgeDescription(id) {
  const descriptions = {
    1: "Complete 5 tasks before 9 AM",
    2: "Complete 5 tasks after 10 PM",
    3: "Maintain a 7-day streak",
    4: "Win all mini games",
    5: "Complete a 30-day fitness plan",
    6: "Create and complete 10 habits"
  }
  return descriptions[id] || `Badge ${id} description`
}

function getBadgePrice(id) {
  const prices = {
    1: 100,
    2: 100,
    3: 200,
    4: 300,
    5: 500,
    6: 500
  }
  return prices[id] || 100
}

function getBadgeRarity(id) {
  const rarities = {
    1: "common",
    2: "common",
    3: "rare",
    4: "rare",
    5: "epic",
    6: "epic"
  }
  return rarities[id] || "common"
}
