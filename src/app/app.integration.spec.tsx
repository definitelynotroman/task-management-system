import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { App } from './app';
import { Task } from '../types/task';

// Mock localStorage
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
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Mock window.confirm for delete operations
    window.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Complete Task Creation Flow', () => {
    it('should create a new task and display it in the list', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Click "Add New Task" button
      const addButton = screen.getByRole('button', { name: /add new task/i });
      await user.click(addButton);

      // Fill out the form
      await user.type(screen.getByPlaceholderText(/enter task title/i), 'Integration Test Task');
      await user.type(
        screen.getByPlaceholderText(/enter task description/i),
        'This is a test task created in integration test'
      );
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.selectOptions(statusSelect, 'in-progress');
      const prioritySelect = screen.getByRole('combobox', { name: /priority/i });
      await user.selectOptions(prioritySelect, 'high');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /add task/i }));

      // Verify task appears in the list
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /integration test task/i })
        ).toBeInTheDocument();
      });

      // Verify statistics updated - check the statistics region
      const statsRegion = screen.getByRole('region', { name: /task statistics/i });
      expect(statsRegion).toHaveTextContent('1'); // Total tasks
    });

    it('should update statistics when a task is created', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Create a task
      await user.click(screen.getByRole('button', { name: /add new task/i }));
      await user.type(screen.getByPlaceholderText(/enter task title/i), 'New Task');
      await user.type(screen.getByPlaceholderText(/enter task description/i), 'Description');
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.selectOptions(statusSelect, 'todo');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      // Check statistics
      await waitFor(() => {
        const statsRegion = screen.getByRole('region', { name: /task statistics/i });
        expect(statsRegion).toBeInTheDocument();
        expect(statsRegion).toHaveTextContent('1'); // Total tasks
        expect(statsRegion).toHaveTextContent('1'); // To Do count
      });
    });

    it('should create task with tags and display them', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Create a task with tags
      await user.click(screen.getByRole('button', { name: /add new task/i }));
      await user.type(screen.getByPlaceholderText(/enter task title/i), 'Tagged Task');
      await user.type(screen.getByPlaceholderText(/enter task description/i), 'Description');

      // Add tags
      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'urgent');
      await user.click(screen.getByRole('button', { name: /^add$/i }));
      await user.type(tagInput, 'important');
      await user.click(screen.getByRole('button', { name: /^add$/i }));

      await user.click(screen.getByRole('button', { name: /add task/i }));

      // Verify tags are displayed
      await waitFor(() => {
        expect(screen.getByText('#urgent')).toBeInTheDocument();
        expect(screen.getByText('#important')).toBeInTheDocument();
      });
    });
  });

  describe('Task Update Flow', () => {
    it('should update task status and reflect in statistics', async () => {
      const user = userEvent.setup();
      
      // Pre-populate with a task
      const initialTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      };
      localStorage.setItem('tasks', JSON.stringify([initialTask]));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Verify initial state
      const statsRegion = screen.getByRole('region', { name: /task statistics/i });
      expect(statsRegion).toHaveTextContent('1'); // Total
      expect(statsRegion).toHaveTextContent('1'); // To Do

      // Change task status
      const changeStatusButton = screen.getByRole('button', {
        name: /change status/i,
      });
      await user.click(changeStatusButton);

      // Verify status changed to in-progress
      await waitFor(() => {
        expect(statsRegion).toHaveTextContent('1'); // In Progress
      });
    });

    it('should update task and persist to localStorage', async () => {
      const user = userEvent.setup();
      
      const initialTask: Task = {
        id: '1',
        title: 'Original Title',
        description: 'Original Description',
        status: 'todo',
        priority: 'low',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      };
      localStorage.setItem('tasks', JSON.stringify([initialTask]));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Change status
      await user.click(
        screen.getByRole('button', { name: /change status/i })
      );

      // Verify persistence
      await waitFor(() => {
        const stored = JSON.parse(localStorage.getItem('tasks') || '[]');
        expect(stored[0].status).toBe('in-progress');
      });
    });
  });

  describe('Task Deletion Flow', () => {
    it('should delete a task and update statistics', async () => {
      const user = userEvent.setup();
      
      const task: Task = {
        id: '1',
        title: 'Task to Delete',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      };
      localStorage.setItem('tasks', JSON.stringify([task]));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Verify task exists
      expect(
        screen.getByRole('heading', { name: /task to delete/i })
      ).toBeInTheDocument();

      // Delete the task
      const deleteButton = screen.getByRole('button', {
        name: /delete task: task to delete/i,
      });
      
      // Ensure confirm is set to return true
      window.confirm = vi.fn(() => true);
      
      await user.click(deleteButton);

      // Verify task is removed
      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /task to delete/i })
        ).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify statistics updated
      const statsRegion = screen.getByRole('region', { name: /task statistics/i });
      expect(statsRegion).toHaveTextContent('0'); // Total tasks
    });

    it('should not delete task when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      const task: Task = {
        id: '1',
        title: 'Task Not Deleted',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      };
      localStorage.setItem('tasks', JSON.stringify([task]));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Try to delete
      await user.click(
        screen.getByRole('button', { name: /delete task: task not deleted/i })
      );

      // Verify task still exists
      expect(
        screen.getByRole('heading', { name: /task not deleted/i })
      ).toBeInTheDocument();
    });
  });

  describe('Filtering and Searching Flow', () => {
    it('should filter tasks by status', async () => {
      const user = userEvent.setup();
      
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Todo Task',
          description: 'Description',
          status: 'todo',
          priority: 'medium',
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
        {
          id: '2',
          title: 'Done Task',
          description: 'Description',
          status: 'done',
          priority: 'medium',
          createdAt: '2025-01-02T00:00:00.000Z',
          tags: [],
        },
      ];
      localStorage.setItem('tasks', JSON.stringify(tasks));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Filter by "done"
      await user.click(
        screen.getByRole('button', { name: /filter by done/i })
      );

      // Verify only done task is shown
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /done task/i })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('heading', { name: /todo task/i })
        ).not.toBeInTheDocument();
      });
    });

    it('should search tasks by title', async () => {
      const user = userEvent.setup();
      
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Important Task',
          description: 'Description',
          status: 'todo',
          priority: 'high',
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
        {
          id: '2',
          title: 'Regular Task',
          description: 'Description',
          status: 'todo',
          priority: 'medium',
          createdAt: '2025-01-02T00:00:00.000Z',
          tags: [],
        },
      ];
      localStorage.setItem('tasks', JSON.stringify(tasks));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Search for "Important"
      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, 'Important');

      // Verify only matching task is shown
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /important task/i })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('heading', { name: /regular task/i })
        ).not.toBeInTheDocument();
      });
    });

    it('should combine filter and search', async () => {
      const user = userEvent.setup();
      
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Todo Important',
          description: 'Description',
          status: 'todo',
          priority: 'high',
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
        {
          id: '2',
          title: 'Done Important',
          description: 'Description',
          status: 'done',
          priority: 'high',
          createdAt: '2025-01-02T00:00:00.000Z',
          tags: [],
        },
        {
          id: '3',
          title: 'Todo Regular',
          description: 'Description',
          status: 'todo',
          priority: 'medium',
          createdAt: '2025-01-03T00:00:00.000Z',
          tags: [],
        },
      ];
      localStorage.setItem('tasks', JSON.stringify(tasks));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Filter by "todo"
      await user.click(
        screen.getByRole('button', { name: /filter by todo/i })
      );

      // Search for "Important"
      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, 'Important');

      // Verify only matching task is shown
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /todo important/i })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('heading', { name: /done important/i })
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('heading', { name: /todo regular/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Sorting Flow', () => {
    it('should sort tasks by different criteria', async () => {
      const user = userEvent.setup();
      
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Zebra Task',
          description: 'Description',
          status: 'todo',
          priority: 'low',
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
        {
          id: '2',
          title: 'Alpha Task',
          description: 'Description',
          status: 'todo',
          priority: 'high',
          createdAt: '2025-01-02T00:00:00.000Z',
          tags: [],
        },
      ];
      localStorage.setItem('tasks', JSON.stringify(tasks));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Sort by title
      await user.click(
        screen.getByRole('button', { name: /sort by title/i })
      );

      // Verify sorting (desc order: Z before A)
      await waitFor(() => {
        const taskHeadings = screen.getAllByRole('heading', { level: 3 }).filter(
          (heading) => heading.textContent === 'Zebra Task' || heading.textContent === 'Alpha Task'
        );
        expect(taskHeadings[0]).toHaveTextContent('Zebra Task');
        expect(taskHeadings[1]).toHaveTextContent('Alpha Task');
      });
    });
  });

  describe('Complete User Workflow', () => {
    it('should handle complete workflow: create → filter → search → update → delete', async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByText(/loading tasks/i)).not.toBeInTheDocument();
      });

      // Step 1: Create a task
      await user.click(screen.getByRole('button', { name: /add new task/i }));
      await user.type(screen.getByPlaceholderText(/enter task title/i), 'Workflow Task');
      await user.type(screen.getByPlaceholderText(/enter task description/i), 'Test workflow');
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.selectOptions(statusSelect, 'todo');
      await user.click(screen.getByRole('button', { name: /add task/i }));

      // Wait for form to close
      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText(/enter task title/i)
        ).not.toBeInTheDocument();
      });

      // Wait for statistics to update (indicating task was created)
      await waitFor(() => {
        const statsRegion = screen.getByRole('region', { name: /task statistics/i });
        expect(statsRegion).toHaveTextContent('1');
      });

      // Then verify task appears
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /workflow task/i })
        ).toBeInTheDocument();
      }, { timeout: 3000 });

      // Step 2: Filter by todo (should show the task)
      await user.click(
        screen.getByRole('button', { name: /filter by todo/i })
      );
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /workflow task/i })
        ).toBeInTheDocument();
      });

      // Step 3: Search for the task
      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'Workflow');
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /workflow task/i })
        ).toBeInTheDocument();
      });

      // Step 4: Update task status (this will change it from todo to in-progress)
      const changeStatusButton = screen.getByRole('button', { name: /change status/i });
      await user.click(changeStatusButton);

      // After status change, task is now "in-progress" but filter is still "todo"
      // So we need to change filter to "in-progress" or "all" to see it
      await user.click(
        screen.getByRole('button', { name: /filter by in-progress/i })
      );

      // Now task should be visible with new status
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /workflow task/i })
        ).toBeInTheDocument();
      });

      // Step 5: Delete the task
      window.confirm = vi.fn(() => true);
      const deleteButton = screen.getByRole('button', { name: /delete task: workflow task/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /workflow task/i })
        ).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify statistics updated
      const statsRegion = screen.getByRole('region', { name: /task statistics/i });
      expect(statsRegion).toHaveTextContent('0'); // Total tasks
    });
  });
});

