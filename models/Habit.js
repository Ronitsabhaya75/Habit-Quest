/**
 * Habit Schema for Mongoose
 * 
 * This schema defines the structure for Habit documents in the MongoDB database.
 * It tracks user-defined habits, including their name, description, start and end dates,
 * frequency, reminders, and progress.
 * 
 * Fields:
 * 
 * 1. user: ObjectId
 *    - Required. References the User document associated with the habit.
 * 
 * 2. name: String
 *    - Required. The name of the habit.
 *    - Must be trimmed and cannot exceed 50 characters.
 * 
 * 3. description: String
 *    - A brief description of the habit.
 *    - Can be trimmed and cannot exceed 500 characters.
 * 
 * 4. startDate: Date
 *    - Required. The date when the habit starts.
 * 
 * 5. endDate: Date
 *    - Required. The date when the habit ends.
 * 
 * 6. frequency: String
 *    - Indicates how often the habit should be performed.
 *    - Must be one of the following: "daily", "weekly", "biweekly".
 *    - Defaults to "daily".
 * 
 * 7. reminder: Boolean
 *    - Indicates whether reminders for this habit are enabled.
 *    - Defaults to true.
 * 
 * 8. xpReward: Number
 *    - The amount of experience points awarded for completing the habit.
 *    - Defaults to 30.
 * 
 * 9. progress: Array
 *    - An array of objects tracking the progress of the habit.
 *    - Each object contains:
 *      - date: Date - The date of completion.
 *      - completed: Boolean - Indicates if the habit was completed on that date.
 * 
 * 10. createdAt: Date
 *     - The timestamp of when the habit was created.
 *     - Defaults to the current date and time.
 */
import mongoose from "mongoose"

const HabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a habit name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  startDate: {
    type: Date,
    required: [true, "Please provide a start date"],
  },
  endDate: {
    type: Date,
    required: [true, "Please provide an end date"],
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "biweekly"],
    default: "daily",
  },
  reminder: {
    type: Boolean,
    default: true,
  },
  xpReward: {
    type: Number,
    default: 30,
  },
  progress: [
    {
      date: Date,
      completed: Boolean,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Habit || mongoose.model("Habit", HabitSchema)
