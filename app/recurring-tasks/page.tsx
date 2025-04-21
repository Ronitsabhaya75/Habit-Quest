"use client"

import RecurringTaskManager from "../../components/RecurringTaskManager"
import { TaskProvider } from "../../components/task-context"

export default function RecurringTasksPage() {
  return (
    <main className="container px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Recurring Tasks Manager</h1>
      <TaskProvider>
        <RecurringTaskManager />
      </TaskProvider>
    </main>
  )
} 