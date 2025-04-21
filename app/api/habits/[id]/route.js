import { NextResponse } from "next/server"
import connectToDatabase from "../../../../lib/mongodb"
import Habit from "../../../../models/Habit"
import { getUserFromToken } from "../../../../lib/auth"

// Get a single habit
export async function GET(request, { params }) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get habit
    const habit = await Habit.findOne({
      _id: params.id,
      user: user._id,
    })

    if (!habit) {
      return NextResponse.json({ success: false, message: "Habit not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: habit }, { status: 200 })
  } catch (error) {
    console.error("Get habit error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Update a habit
export async function PUT(request, { params }) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Get habit data
    const habitData = await request.json()

    // Find the habit
    const habit = await Habit.findOne({
      _id: params.id,
      user: user._id,
    })

    if (!habit) {
      return NextResponse.json({ success: false, message: "Habit not found" }, { status: 404 })
    }

    // Update habit
    const updatedHabit = await Habit.findByIdAndUpdate(params.id, habitData, { new: true })

    return NextResponse.json({ success: true, data: updatedHabit }, { status: 200 })
  } catch (error) {
    console.error("Update habit error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

// Delete a habit
export async function DELETE(request, { params }) {
  try {
    // Get user from token
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Delete habit
    const habit = await Habit.findOneAndDelete({
      _id: params.id,
      user: user._id,
    })

    if (!habit) {
      return NextResponse.json({ success: false, message: "Habit not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 })
  } catch (error) {
    console.error("Delete habit error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
