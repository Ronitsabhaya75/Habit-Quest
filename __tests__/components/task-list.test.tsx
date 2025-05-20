import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../../components/task-list';
import { TaskProvider } from '../../components/task-context';
import * as ToastModule from '../../components/ui/use-toast';

// Mock the task context
const mockTasks = [
  { _id: 'task1', title: 'Task 1', completed: false, dueDate: new Date('2023-06-15'), isHabit: false, isRecurring: false },
  { _id: 'task2', title: 'Task 2', completed: true, dueDate: new Date('2023-06-15'), isHabit: true, isRecurring: true, frequency: 'daily' },
  { _id: 'task3', title: 'Task 3', completed: false, dueDate: new Date('2023-06-16'), isHabit: false, isRecurring: true, frequency: 'weekly' }
];

// Mock fetch with a more controlled implementation
const mockFetchResponse = {
  ok: true,
  json: jest.fn().mockResolvedValue({
    success: true,
    data: { streak: 5, lastActiveFormatted: 'Today at 10:00 AM', streakExpiresIn: { hours: 12 } }
  })
};

global.fetch = jest.fn().mockResolvedValue(mockFetchResponse) as jest.Mock;

// Mock window event listeners
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
const mockListeners: Record<string, EventListener[]> = {};

window.addEventListener = jest.fn((event, cb) => {
  if (!mockListeners[event]) {
    mockListeners[event] = [];
  }
  mockListeners[event].push(cb as EventListener);
});

window.removeEventListener = jest.fn((event, cb) => {
  if (mockListeners[event]) {
    const index = mockListeners[event].indexOf(cb as EventListener);
    if (index > -1) {
      mockListeners[event].splice(index, 1);
    }
  }
});

// Mock local storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the task context
jest.mock('../../components/task-context', () => {
  const useTask = () => ({
    tasks: mockTasks,
    addTask: jest.fn((task) => {
      mockTasks.push({ _id: `task${mockTasks.length + 1}`, ...task, completed: false });
    }),
    updateTask: jest.fn(({ id, ...updates }) => {
      const index = mockTasks.findIndex(task => task._id === id);
      if (index >= 0) {
        mockTasks[index] = { ...mockTasks[index], ...updates };
      }
    }),
    removeTask: jest.fn((id) => {
      const index = mockTasks.findIndex(task => task._id === id);
      if (index >= 0) {
        mockTasks.splice(index, 1);
      }
    }),
    getTasksForDate: jest.fn((date) => {
      const dateStr = date.toISOString().split('T')[0];
      return mockTasks.filter(task => {
        const taskDateStr = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDateStr === dateStr;
      });
    })
  });

  return {
    useTask,
    TaskProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  };
});

// Mock toast notifications
jest.mock('../../components/ui/use-toast', () => ({
  useToast: jest.fn(() => ({
    toast: jest.fn()
  }))
}));

describe('TaskList Component', () => {
  const todayDate = new Date();
  let toastMock: jest.Mock;

  // Set global timeout for all tests
  jest.setTimeout(10000);

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchResponse.json.mockClear();
    global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);
    toastMock = jest.fn();
    (ToastModule.useToast as jest.Mock).mockReturnValue({ toast: toastMock });
  });

  afterEach(() => {
    // Clear all mock listeners to prevent leaks
    for (const event in mockListeners) {
      mockListeners[event] = [];
    }
  });

  afterAll(() => {
    // Restore original event listeners
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it('renders tasks for the current date', async () => {
    render(<TaskList date={new Date('2023-06-15')} />);

    // Check if tasks for the date are rendered
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument(); // Different date

    // Check if habit indicator is shown
    expect(screen.getByText('(daily habit)')).toBeInTheDocument();
  });

  it('shows "no tasks" message when no tasks are available', () => {
    render(<TaskList date={new Date('2023-07-01')} />);
    
    expect(screen.getByText(/No tasks for this date/i)).toBeInTheDocument();
  });

  it('handles task completion toggle', async () => {
    const { getTasksForDate, updateTask } = require('../../components/task-context').useTask();
    getTasksForDate.mockReturnValue([mockTasks[0]]); // Return only first task

    render(<TaskList date={new Date('2023-06-15')} />);

    // Check if task is initially uncompleted
    const checkbox = screen.getByRole('checkbox', { name: /Task 1/i });
    expect(checkbox).not.toBeChecked();

    // Toggle the task
    await userEvent.click(checkbox);

    // Verify updateTask was called with correct args
    expect(updateTask).toHaveBeenCalledWith({
      id: 'task1',
      completed: true
    });

    // Verify toast notification was shown
    expect(toastMock).toHaveBeenCalledWith({
      title: "Task Completed!",
      description: "Great job on completing your task!"
    });
  });

  it('opens dialog to add a new task', async () => {
    render(<TaskList date={todayDate} />);
    
    // Click the Add Task button
    await userEvent.click(screen.getByRole('button', { name: /\+ Add Task/i }));
    
    // Verify dialog is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Task')).toBeInTheDocument();
  });

  it('allows editing a task title', async () => {
    const { getTasksForDate, updateTask } = require('../../components/task-context').useTask();
    getTasksForDate.mockReturnValue([mockTasks[0]]); // Return only first task

    render(<TaskList date={new Date('2023-06-15')} />);

    // Click the edit button
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(button => button.innerHTML.includes('Pencil'));
    await userEvent.click(editButton!);

    // Verify edit mode is active
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Task 1');

    // Edit the task
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated Task 1');

    // Save the changes
    const saveButton = screen.getByText('✓');
    await userEvent.click(saveButton);

    // Verify updateTask was called with correct args
    expect(updateTask).toHaveBeenCalledWith({
      id: 'task1',
      title: 'Updated Task 1'
    });
  });

  it('handles task deletion', async () => {
    const { getTasksForDate, removeTask } = require('../../components/task-context').useTask();
    getTasksForDate.mockReturnValue([mockTasks[0]]); // Return only first task

    render(<TaskList date={new Date('2023-06-15')} />);

    // Click the delete button
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => button.innerHTML.includes('Trash'));
    await userEvent.click(deleteButton!);

    // Verify confirmation dialog appears
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

    // Confirm deletion
    await userEvent.click(screen.getByRole('button', { name: /Delete Task/i }));

    // Verify removeTask was called with correct ID
    expect(removeTask).toHaveBeenCalledWith('task1');
  });

  it('shows streak information when user has an active streak', async () => {
    render(<TaskList date={todayDate} />);
    
    // Wait for the streak information to load with a timeout
    await waitFor(() => {
      expect(screen.getByText('5 Day Streak!')).toBeInTheDocument();
      expect(screen.getByText('Last activity: Today at 10:00 AM')).toBeInTheDocument();
      expect(screen.getByText('12 hours left')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
}); 