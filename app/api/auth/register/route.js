import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request) {
  try {
    const { username, email, password } = await request.json()

    // Enhanced validation
    const errors = [];
    
    if (!username) errors.push("Username is required");
    else if (username.length < 3) errors.push("Username must be at least 3 characters");
    else if (username.length > 20) errors.push("Username cannot be more than 20 characters");
    
    if (!email) errors.push("Email is required");
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push("Please provide a valid email address");
    }
    
    if (!password) errors.push("Password is required");
    else if (password.length < 6) errors.push("Password must be at least 6 characters");
    
    if (errors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: errors.join(", ") 
      }, { status: 400 });
    }

    // Connect to the database
    await connectToDatabase()

    // Check if user already exists with more detailed error message
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      if (existingUser.email === email && existingUser.username === username) {
        return NextResponse.json({ 
          success: false, 
          message: "Both email and username are already in use" 
        }, { status: 400 });
      } else if (existingUser.email === email) {
        return NextResponse.json({ 
          success: false, 
          message: "Email is already in use" 
        }, { status: 400 });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: "Username is already in use" 
        }, { status: 400 });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    })

    // Return success without password
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
    }

    return NextResponse.json({ success: true, data: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Server error during registration" 
    }, { status: 500 })
  }
}
