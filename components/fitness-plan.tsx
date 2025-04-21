"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { Badge } from "./ui/badge"

const workoutPlan = [
  {
    day: "Monday",
    focus: "Cardio",
    exercises: [
      { name: "Running", duration: "30 minutes", intensity: "Moderate" },
      { name: "Jumping Jacks", sets: 3, reps: 20 },
      { name: "Mountain Climbers", sets: 3, reps: 15 },
      { name: "Burpees", sets: 3, reps: 10 },
    ],
  },
  {
    day: "Tuesday",
    focus: "Upper Body",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 12 },
      { name: "Dumbbell Rows", sets: 3, reps: 10 },
      { name: "Shoulder Press", sets: 3, reps: 10 },
      { name: "Tricep Dips", sets: 3, reps: 12 },
    ],
  },
  {
    day: "Wednesday",
    focus: "Rest Day",
    exercises: [
      { name: "Light Stretching", duration: "15 minutes" },
      { name: "Walking", duration: "20 minutes", intensity: "Low" },
    ],
  },
  {
    day: "Thursday",
    focus: "Lower Body",
    exercises: [
      { name: "Squats", sets: 3, reps: 15 },
      { name: "Lunges", sets: 3, reps: 12 },
      { name: "Calf Raises", sets: 3, reps: 20 },
      { name: "Glute Bridges", sets: 3, reps: 15 },
    ],
  },
  {
    day: "Friday",
    focus: "Core",
    exercises: [
      { name: "Plank", sets: 3, duration: "30 seconds" },
      { name: "Crunches", sets: 3, reps: 20 },
      { name: "Russian Twists", sets: 3, reps: 15 },
      { name: "Leg Raises", sets: 3, reps: 12 },
    ],
  },
  {
    day: "Saturday",
    focus: "Full Body",
    exercises: [
      { name: "Burpees", sets: 3, reps: 10 },
      { name: "Kettlebell Swings", sets: 3, reps: 15 },
      { name: "Mountain Climbers", sets: 3, reps: 20 },
      { name: "Jump Squats", sets: 3, reps: 12 },
    ],
  },
  {
    day: "Sunday",
    focus: "Rest Day",
    exercises: [
      { name: "Yoga", duration: "30 minutes" },
      { name: "Meditation", duration: "10 minutes" },
    ],
  },
]

export function FitnessPlan() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {workoutPlan.map((day, index) => (
        <AccordionItem key={index} value={`day-${index}`} className="border-[#2a3343]">
          <AccordionTrigger className="text-white hover:text-[#4cc9f0]">
            <div className="flex items-center space-x-2">
              <span>{day.day}</span>
              <Badge className="bg-[#4cc9f0] text-black">{day.focus}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-gray-400">
            <ul className="space-y-2">
              {day.exercises.map((exercise, i) => (
                <li key={i} className="flex justify-between items-center p-2 hover:bg-[#2a3343] rounded-md">
                  <span>{exercise.name}</span>
                  <span>
                    {exercise.sets && exercise.reps && `${exercise.sets} sets × ${exercise.reps} reps`}
                    {exercise.duration && `${exercise.duration}`}
                    {exercise.intensity && ` (${exercise.intensity})`}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
