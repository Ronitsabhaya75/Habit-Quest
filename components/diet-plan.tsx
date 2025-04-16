"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const dietPlan = [
  {
    meal: "Breakfast",
    options: [
      { name: "Oatmeal with berries and nuts", calories: 350, protein: "15g", carbs: "45g", fat: "12g" },
      { name: "Greek yogurt with honey and granola", calories: 320, protein: "20g", carbs: "40g", fat: "8g" },
      { name: "Avocado toast with eggs", calories: 400, protein: "18g", carbs: "30g", fat: "22g" },
    ],
  },
  {
    meal: "Morning Snack",
    options: [
      { name: "Apple with almond butter", calories: 200, protein: "5g", carbs: "25g", fat: "10g" },
      { name: "Protein smoothie", calories: 250, protein: "20g", carbs: "30g", fat: "5g" },
      { name: "Handful of mixed nuts", calories: 180, protein: "6g", carbs: "8g", fat: "15g" },
    ],
  },
  {
    meal: "Lunch",
    options: [
      { name: "Grilled chicken salad", calories: 450, protein: "35g", carbs: "20g", fat: "25g" },
      { name: "Quinoa bowl with vegetables", calories: 420, protein: "15g", carbs: "60g", fat: "12g" },
      { name: "Turkey and avocado wrap", calories: 480, protein: "30g", carbs: "40g", fat: "20g" },
    ],
  },
  {
    meal: "Afternoon Snack",
    options: [
      { name: "Greek yogurt with berries", calories: 150, protein: "15g", carbs: "15g", fat: "3g" },
      { name: "Protein bar", calories: 200, protein: "20g", carbs: "20g", fat: "8g" },
      { name: "Hummus with carrot sticks", calories: 180, protein: "6g", carbs: "20g", fat: "8g" },
    ],
  },
  {
    meal: "Dinner",
    options: [
      { name: "Grilled salmon with roasted vegetables", calories: 500, protein: "40g", carbs: "25g", fat: "25g" },
      { name: "Lean beef stir-fry with brown rice", calories: 550, protein: "35g", carbs: "60g", fat: "15g" },
      { name: "Vegetable and bean chili", calories: 420, protein: "20g", carbs: "65g", fat: "10g" },
    ],
  },
  {
    meal: "Evening Snack (Optional)",
    options: [
      { name: "Cottage cheese with pineapple", calories: 150, protein: "15g", carbs: "15g", fat: "2g" },
      { name: "Casein protein shake", calories: 120, protein: "24g", carbs: "3g", fat: "1g" },
      { name: "Small handful of almonds", calories: 100, protein: "4g", carbs: "3g", fat: "9g" },
    ],
  },
]

export function DietPlan() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {dietPlan.map((meal, index) => (
        <AccordionItem key={index} value={`meal-${index}`} className="border-[#2a3343]">
          <AccordionTrigger className="text-white hover:text-[#4cc9f0]">{meal.meal}</AccordionTrigger>
          <AccordionContent className="text-gray-400">
            <div className="space-y-4">
              {meal.options.map((option, i) => (
                <div key={i} className="p-3 rounded-md hover:bg-[#2a3343]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-white">{option.name}</span>
                    <Badge className="bg-[#4cc9f0] text-black">{option.calories} cal</Badge>
                  </div>
                  <div className="flex space-x-4 text-xs">
                    <span>Protein: {option.protein}</span>
                    <span>Carbs: {option.carbs}</span>
                    <span>Fat: {option.fat}</span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
