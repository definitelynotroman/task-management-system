import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTasks } from './useTasks';
import * as taskHelpers from '../utils/taskHelpers';
import { Task } from '../types/task';

// Mock the taskHelpers module
vi.mock('../utils/taskHelpers', () => ({
  loadTasksFromStorage: vi.fn(),
  saveTasksToStorage: vi.fn(),
}));

describe('useTasks', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'todo',
      priority: 'high',
      createdAt: '2025-01-01T00:00:00.000Z',
      tags: [],
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2025-01-02T00:00:00.000Z',
      tags: ['urgent'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock crypto.randomUUID
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('12345678-1234-1234-1234-123456789abc');
    // Mock Date for consistent createdAt values
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should load tasks from storage on mount', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      expect(taskHelpers.loadTasksFromStorage).toHaveBeenCalledTimes(1);
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
    });

    it('should initialize with empty array when no tasks in storage', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('addTask', () => {
    it('should add a new task with generated id and createdAt', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'todo' as const,
        priority: 'medium' as const,
        tags: [],
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual({
        ...newTask,
        id: '12345678-1234-1234-1234-123456789abc',
        createdAt: '2025-01-15T12:00:00.000Z',
      });
    });

    it('should add task to existing tasks array', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'todo' as const,
        priority: 'low' as const,
        tags: [],
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.tasks[2].title).toBe('New Task');
    });

    it('should save tasks to storage after adding', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      const newTask = {
        title: 'Task to Save',
        description: 'Description',
        status: 'todo' as const,
        priority: 'high' as const,
        tags: [],
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(taskHelpers.saveTasksToStorage).toHaveBeenCalled();

      const savedTasks = vi.mocked(taskHelpers.saveTasksToStorage).mock.calls[0][0];
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks[0].title).toBe('Task to Save');
    });

    it('should generate unique IDs using crypto.randomUUID', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask({
          title: 'Task',
          description: 'Description',
          status: 'todo',
          priority: 'medium',
          tags: [],
        });
      });

      expect(crypto.randomUUID).toHaveBeenCalled();
    });

    it('should add task with optional dueDate when provided', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      const newTask = {
        title: 'Task with Due Date',
        description: 'Description',
        status: 'todo' as const,
        priority: 'high' as const,
        dueDate: '2025-12-31',
        tags: [],
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks[0].dueDate).toBe('2025-12-31');
    });

    it('should add task with tags', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      const newTask = {
        title: 'Task with Tags',
        description: 'Description',
        status: 'todo' as const,
        priority: 'medium' as const,
        tags: ['urgent', 'important'],
      };

      act(() => {
        result.current.addTask(newTask);
      });

      expect(result.current.tasks[0].tags).toEqual(['urgent', 'important']);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.updateTask('1', { status: 'done' });
      });

      const updatedTask = result.current.tasks.find((t) => t.id === '1');
      expect(updatedTask?.status).toBe('done');
    });

    it('should update multiple properties at once', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.updateTask('2', {
          status: 'done',
          priority: 'low',
          title: 'Updated Title',
        });
      });

      const updatedTask = result.current.tasks.find((t) => t.id === '2');
      expect(updatedTask?.status).toBe('done');
      expect(updatedTask?.priority).toBe('low');
      expect(updatedTask?.title).toBe('Updated Title');
    });

    it('should not modify other tasks when updating one', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.updateTask('1', { status: 'done' });
      });

      const otherTask = result.current.tasks.find((t) => t.id === '2');
      expect(otherTask?.status).toBe('in-progress');
      expect(otherTask?.title).toBe('Task 2');
    });

    it('should save tasks to storage after updating', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.updateTask('1', { status: 'done' });
      });

      expect(taskHelpers.saveTasksToStorage).toHaveBeenCalled();

      const savedTasks = vi.mocked(taskHelpers.saveTasksToStorage).mock.calls[0][0];
      expect(savedTasks.find((t) => t.id === '1')?.status).toBe('done');
    });

    it('should handle updating non-existent task gracefully', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.updateTask('non-existent-id', { status: 'done' });
      });

      expect(result.current.tasks).toHaveLength(2);
      // Original tasks should remain unchanged
      expect(result.current.tasks).toEqual(mockTasks);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task by id', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.deleteTask('1');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks.find((t) => t.id === '1')).toBeUndefined();
    });

    it('should keep other tasks when deleting one', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.deleteTask('1');
      });

      const remainingTask = result.current.tasks.find((t) => t.id === '2');
      expect(remainingTask).toBeDefined();
      expect(remainingTask?.title).toBe('Task 2');
    });

    it('should save tasks to storage after deleting', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.deleteTask('1');
      });

      expect(taskHelpers.saveTasksToStorage).toHaveBeenCalled();

      const savedTasks = vi.mocked(taskHelpers.saveTasksToStorage).mock.calls[0][0];
      expect(savedTasks).toHaveLength(1);
      expect(savedTasks.find((t) => t.id === '1')).toBeUndefined();
    });

    it('should handle deleting non-existent task gracefully', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.deleteTask('non-existent-id');
      });

      expect(result.current.tasks).toHaveLength(2);
      // All tasks should remain
      expect(result.current.tasks).toEqual(mockTasks);
    });

    it('should delete all tasks when called multiple times', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.deleteTask('1');
      });

      expect(result.current.tasks).toHaveLength(1);

      act(() => {
        result.current.deleteTask('2');
      });

      expect(result.current.tasks).toHaveLength(0);
    });
  });

  describe('Return values', () => {
    it('should return tasks array', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toBeDefined();
      expect(Array.isArray(result.current.tasks)).toBe(true);
    });

    it('should return loading state', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      expect(result.current.loading).toBeDefined();
      expect(typeof result.current.loading).toBe('boolean');
    });

    it('should return addTask function', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      expect(result.current.addTask).toBeDefined();
      expect(typeof result.current.addTask).toBe('function');
    });

    it('should return updateTask function', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      expect(result.current.updateTask).toBeDefined();
      expect(typeof result.current.updateTask).toBe('function');
    });

    it('should return deleteTask function', () => {
      vi.mocked(taskHelpers.loadTasksFromStorage).mockReturnValue([]);

      const { result } = renderHook(() => useTasks());

      expect(result.current.deleteTask).toBeDefined();
      expect(typeof result.current.deleteTask).toBe('function');
    });
  });
});
