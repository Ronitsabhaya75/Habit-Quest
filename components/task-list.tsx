"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TaskListProps {
  date?: Date
}

export function TaskList({ date = new Date() }: TaskListProps) {
  const [tasks, setTasks] = useState<{ id: number; title: string; completed: boolean; date: Date }[]>([
    { id: 1, title: "Morning meditation", completed: false, date: new Date() },
    { id: 2, title: "Read for 30 minutes", completed: true, date: new Date() },
  ])

  const [editingTask, setEditingTask] = useState<{ id: number; title: string } | null>(null)

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const updateTask = () => {
    if (editingTask && editingTask.title.trim()) {
      setTasks(tasks.map((task) => (task.id === editingTask.id ? { ...task, title: editingTask.title } : task)))
      setEditingTask(null)
    }
  }

  // Filter tasks for the selected date
  const filteredTasks = tasks.filter((task) => task.date.toDateString() === date.toDateString())

  return (
    <div className="space-y-4">
      {filteredTasks.length > 0 ? (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#2a3343] transition-colors"
            >
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="text-[#4cc9f0] border-[#4cc9f0]"
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`text-white flex-1 cursor-pointer ${task.completed ? "line-through text-gray-400" : ""}`}
              >
                {task.title}
              </label>
              <div className="flex space-x-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white"
                      onClick={() => setEditingTask({ id: task.id, title: task.title })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1a2332] border-[#2a3343] text-white">
                    <DialogHeader>
                      <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-task-title">Task Name</Label>
                        <Input
                          id="edit-task-title"
                          placeholder="Enter task name"
                          value={editingTask?.title || ""}
                          onChange={(e) => setEditingTask((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                          className="bg-[#2a3343] border-[#3a4353] text-white"
                        />
                      </div>
                      <Button className="w-full bg-[#4cc9f0] hover:bg-[#4cc9f0]/80 text-black" onClick={updateTask}>
                        Update Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-500"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">No tasks for this date. Add a task to get started!</div>
      )}
    </div>
  )
}
