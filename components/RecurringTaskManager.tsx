"use client"

import React, { useState, useEffect } from "react"
import { useTask, Task } from "./task-context"
import { format } from "date-fns"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "./ui/card"
import { Button } from "./ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "./ui/dialog"
import { Calendar } from "./ui/calendar"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select"
import { CalendarIcon, RotateCw, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { 
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form
} from "./ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  xpReward: z.number().min(1, "XP must be at least 1").default(10),
  isRecurring: z.boolean().default(true),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
  recurringEndDate: z.date().optional().nullable(),
})

export default function RecurringTaskManager() {
  const { tasks, loading, fetchTasks, addTask, updateTask, removeTask } = useTask()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [deleteAllInstances, setDeleteAllInstances] = useState(false)
  const [updateAllInstances, setUpdateAllInstances] = useState(false)
  
  // Group tasks by parentTaskId or their own ID if they are parent tasks
  const recurringTaskGroups = React.useMemo(() => {
    const groups: { [key: string]: Task[] } = {}
    
    // First identify all recurring tasks
    tasks.forEach(task => {
      if (task.isRecurring) {
        if (task.parentTaskId) {
          // This is a child task, add it to its parent's group
          const parentId = task.parentTaskId
          if (!groups[parentId]) {
            groups[parentId] = []
          }
          groups[parentId].push(task)
        } else {
          // This is a parent task, create a new group with this task as the first item
          if (!groups[task._id]) {
            groups[task._id] = []
          }
          groups[task._id].push(task)
        }
      }
    })
    
    // Sort each group by dueDate
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
    })
    
    return groups
  }, [tasks])
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      xpReward: 10,
      isRecurring: true,
      frequency: "daily" as const,
    },
  })
  
  useEffect(() => {
    if (selectedTask && showEditDialog) {
      form.reset({
        title: selectedTask.title,
        description: selectedTask.description || "",
        dueDate: new Date(selectedTask.dueDate),
        xpReward: selectedTask.xpReward,
        isRecurring: selectedTask.isRecurring,
        frequency: selectedTask.frequency || "daily",
        recurringEndDate: selectedTask.recurringEndDate ? new Date(selectedTask.recurringEndDate) : null,
      })
    }
  }, [selectedTask, showEditDialog, form])
  
  const handleNewTask = async (data: z.infer<typeof formSchema>) => {
    try {
      await addTask({
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        xpReward: data.xpReward,
        isRecurring: true,
        frequency: data.frequency,
        recurringEndDate: data.recurringEndDate,
      })
      
      setShowNewTaskDialog(false)
      form.reset()
    } catch (error) {
      console.error("Error creating task:", error)
      toast.error("Failed to create recurring task")
    }
  }
  
  const handleEditTask = async (data: z.infer<typeof formSchema>) => {
    if (!selectedTask) return
    
    try {
      await updateTask(selectedTask._id, {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        xpReward: data.xpReward,
        frequency: data.frequency,
        recurringEndDate: data.recurringEndDate,
        updateAllInstances: updateAllInstances
      })
      
      setShowEditDialog(false)
      setSelectedTask(null)
      setUpdateAllInstances(false)
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update recurring task")
    }
  }
  
  const handleDeleteTask = async () => {
    if (!selectedTask) return
    
    try {
      await removeTask(selectedTask._id, deleteAllInstances)
      setShowDeleteDialog(false)
      setSelectedTask(null)
      setDeleteAllInstances(false)
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task")
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recurring Tasks</h2>
        <Button onClick={() => setShowNewTaskDialog(true)}>
          Add Recurring Task
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <RotateCw className="animate-spin h-8 w-8" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.keys(recurringTaskGroups).length > 0 ? (
            Object.entries(recurringTaskGroups).map(([groupId, tasks]) => (
              <Card key={groupId} className="shadow-md">
                <CardHeader>
                  <CardTitle>{tasks[0].title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {tasks[0].frequency} · {tasks.length} instances
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    {tasks[0].description || "No description"}
                  </div>
                  <div className="text-sm font-semibold">
                    Next due: {format(new Date(tasks[0].dueDate), "PPP")}
                  </div>
                  <div className="text-sm">
                    {tasks[0].recurringEndDate 
                      ? `Ends: ${format(new Date(tasks[0].recurringEndDate), "PPP")}`
                      : "No end date"
                    }
                  </div>
                  <div className="text-sm">
                    XP Reward: {tasks[0].xpReward}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedTask(tasks[0])
                      setShowEditDialog(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => {
                      setSelectedTask(tasks[0])
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-muted-foreground">
              No recurring tasks. Create one to get started.
            </div>
          )}
        </div>
      )}
      
      {/* New Task Dialog */}
      <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Recurring Task</DialogTitle>
            <DialogDescription>
              Create a new recurring task that will repeat based on the selected frequency.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleNewTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>First Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Biweekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="recurringEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Leave blank for a task that recurs indefinitely
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="xpReward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>XP Reward</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewTaskDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Recurring Task</DialogTitle>
            <DialogDescription>
              Update the recurring task details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditTask)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Biweekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="xpReward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>XP Reward</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="recurringEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Leave blank for a task that recurs indefinitely
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="update-all" 
                  checked={updateAllInstances}
                  onCheckedChange={(checked) => 
                    setUpdateAllInstances(checked === true)
                  }
                />
                <label 
                  htmlFor="update-all" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Update all future instances
                </label>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {updateAllInstances 
                  ? "Changes will apply to this task and all future recurring instances."
                  : "Changes will only apply to this specific task."}
              </p>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditDialog(false)
                    setUpdateAllInstances(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Task</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Recurring Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recurring task?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="delete-all" 
                checked={deleteAllInstances}
                onCheckedChange={(checked) => 
                  setDeleteAllInstances(checked === true)
                }
              />
              <label 
                htmlFor="delete-all" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Delete all recurring instances
              </label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {deleteAllInstances 
                ? "This will delete this task and all its recurring instances."
                : "This will only delete this specific task instance."}
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteTask}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 