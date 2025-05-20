/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/tasks/route';

// Mock dependencies
jest.mock('../../lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../lib/auth', () => ({
  getUserFromToken: jest.fn(),
}));

// Mock variables need to be declared outside the mock function
let mockSave: jest.Mock;
let mockSort: jest.Mock;
let mockFind: jest.Mock;

// Initialize the mock functions before using them
beforeAll(() => {
  mockSave = jest.fn().mockResolvedValue(true);
  mockSort = jest.fn();
  mockFind = jest.fn().mockReturnValue({ sort: mockSort });
});

// Mock Task module after the variables are defined
jest.mock('../../models/Task', () => {
  // We return a factory function so that the mocks can be initialized before use
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((data) => {
      return {
        ...data,
        save: mockSave
      };
    })
  };
});

describe('Tasks API', () => {
  let mockRequest: NextRequest;
  const mockUser = {
    _id: 'user123',
    username: 'testuser',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSort.mockReset();
    mockFind.mockReset();
    mockFind.mockReturnValue({ sort: mockSort });

    // Set up Task.find static method
    const TaskModel = require('../../models/Task').default;
    TaskModel.find = mockFind;

    // Mock Request with different implementations for different tests
    mockRequest = {
      url: 'http://localhost:3000/api/tasks',
      headers: {
        get: jest.fn().mockReturnValue('Bearer token123'),
      },
    } as unknown as NextRequest;
  });

  describe('GET /api/tasks', () => {
    it('should return unauthorized if no user is found', async () => {
      // Mock getUserFromToken to return null (no user)
      require('../../lib/auth').getUserFromToken.mockResolvedValueOnce(null);

      const response = await GET(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return tasks for a user', async () => {
      // Mock getUserFromToken to return a user
      require('../../lib/auth').getUserFromToken.mockResolvedValueOnce(mockUser);

      // Create serialized versions of dates (string format) since that's what JSON gives us
      const date1 = new Date();
      const serializedDate1 = date1.toISOString();
      
      // Mock Task.find to return mock tasks
      const mockTasks = [
        { _id: 'task1', title: 'Task 1', dueDate: serializedDate1, user: 'user123' },
        { _id: 'task2', title: 'Task 2', dueDate: serializedDate1, user: 'user123' },
      ];
      
      mockSort.mockResolvedValueOnce(mockTasks);

      const response = await GET(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        success: true,
        data: mockTasks,
      });
    });

    it('should filter tasks by date', async () => {
      // Create a new mock request with date parameter
      const dateRequest = {
        url: 'http://localhost:3000/api/tasks?date=2023-05-15',
        headers: {
          get: jest.fn().mockReturnValue('Bearer token123'),
        },
      } as unknown as NextRequest;

      // Mock getUserFromToken to return a user
      require('../../lib/auth').getUserFromToken.mockResolvedValueOnce(mockUser);

      // Create serialized versions of dates (string format)
      const date = new Date('2023-05-15');
      const serializedDate = date.toISOString();
      
      // Mock Task.find to return mock tasks
      const mockTasks = [
        { _id: 'task1', title: 'Task 1', dueDate: serializedDate, user: 'user123' },
      ];
      
      mockSort.mockResolvedValueOnce(mockTasks);

      const response = await GET(dateRequest);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        success: true,
        data: mockTasks,
      });
      
      // Verify the query had the correct date filter
      expect(mockFind).toHaveBeenCalledWith({
        user: 'user123',
        dueDateString: '2023-05-15',
      });
    });
  });

  describe('POST /api/tasks', () => {
    it('should return unauthorized if no user is found', async () => {
      // Mock getUserFromToken to return null (no user)
      require('../../lib/auth').getUserFromToken.mockResolvedValueOnce(null);

      // Mock request.json
      mockRequest.json = jest.fn().mockResolvedValueOnce({
        title: 'New Task',
        description: 'Test description',
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should require a task title', async () => {
      // Mock getUserFromToken to return a user
      require('../../lib/auth').getUserFromToken.mockResolvedValueOnce(mockUser);

      // Mock request.json with missing title
      mockRequest.json = jest.fn().mockResolvedValueOnce({
        description: 'Test description without title',
      });

      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        success: false,
        message: 'Task title is required',
      });
    });

    it('should create a new task', async () => {
      // Mock getUserFromToken to return a user
      require('../../lib/auth').getUserFromToken.mockResolvedValueOnce(mockUser);

      // Mock request.json with task data
      const mockTaskData = {
        title: 'New Task',
        description: 'Test description',
        dueDate: '2023-05-20T00:00:00.000Z',
      };
      mockRequest.json = jest.fn().mockResolvedValueOnce(mockTaskData);
      
      const response = await POST(mockRequest);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(mockSave).toHaveBeenCalled();
      
      // Check that Task constructor was called with correct data
      const TaskModel = require('../../models/Task').default;
      expect(TaskModel).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
        description: 'Test description',
        user: mockUser._id,
        completed: false,
        completedAt: null
      }));
    });
  });
}); 