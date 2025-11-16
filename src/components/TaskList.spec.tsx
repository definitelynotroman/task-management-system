import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { TaskList } from './TaskList';
import { Task } from '../types/task';

describe('TaskList', () => {
  const mockOnUpdateTask = vi.fn();
  const mockOnDeleteTask = vi.fn();

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'First task description',
      status: 'todo',
      priority: 'high',
      createdAt: '2025-01-01T00:00:00.000Z',
      dueDate: '2025-12-31T00:00:00.000Z',
      tags: ['urgent'],
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Second task description',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2025-01-02T00:00:00.000Z',
      dueDate: '2025-11-30T00:00:00.000Z',
      tags: ['feature'],
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Third task description',
      status: 'done',
      priority: 'low',
      createdAt: '2025-01-03T00:00:00.000Z',
      dueDate: undefined,
      tags: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm for delete operations in TaskCard
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render all tasks when filter is "all"', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByRole('heading', { name: 'Task 1' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Task 2' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Task 3' })).toBeInTheDocument();
    });

    it('should render sorting controls', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByRole('button', { name: /sort by created date/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by due date/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by priority/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by title/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle sort order/i })).toBeInTheDocument();
    });

    it('should have proper accessibility attributes on sort buttons', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const sortGroup = screen.getByRole('group', { name: /sort tasks/i });
      expect(sortGroup).toBeInTheDocument();

      const createdDateButton = screen.getByRole('button', { name: /sort by created date/i });
      expect(createdDateButton).toHaveAttribute('aria-pressed', 'true'); // default sort
    });
  });

  describe('Status Filtering', () => {
    it('should filter tasks by "todo" status', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="todo"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByRole('heading', { name: 'Task 1' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 2' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 3' })).not.toBeInTheDocument();
    });

    it('should filter tasks by "in-progress" status', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="in-progress"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.queryByRole('heading', { name: 'Task 1' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Task 2' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 3' })).not.toBeInTheDocument();
    });

    it('should filter tasks by "done" status', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="done"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.queryByRole('heading', { name: 'Task 1' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 2' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Task 3' })).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    it('should filter tasks by title search query', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery="Task 1"
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByRole('heading', { name: 'Task 1' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 2' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 3' })).not.toBeInTheDocument();
    });

    it('should filter tasks by description search query', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery="Second task"
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.queryByRole('heading', { name: 'Task 1' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Task 2' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 3' })).not.toBeInTheDocument();
    });

    it('should perform case-insensitive search', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery="TASK 3"
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByRole('heading', { name: 'Task 3' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 1' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 2' })).not.toBeInTheDocument();
    });

    it('should combine status filter and search query', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="todo"
          searchQuery="Task 1"
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByRole('heading', { name: 'Task 1' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 2' })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Task 3' })).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort tasks by created date in descending order by default', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const taskHeadings = screen.getAllByRole('heading', { level: 3 });
      // Most recent first (desc)
      expect(taskHeadings[0]).toHaveTextContent('Task 3');
      expect(taskHeadings[1]).toHaveTextContent('Task 2');
      expect(taskHeadings[2]).toHaveTextContent('Task 1');
    });

    it('should sort tasks by due date when due date button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      await user.click(screen.getByRole('button', { name: /sort by due date/i }));

      const taskHeadings = screen.getAllByRole('heading', { level: 3 });
      // Desc order: Task 1 (2025-12-31) latest first, Task 2 (2025-11-30) earlier second, Task 3 (no due date) always last
      expect(taskHeadings[0]).toHaveTextContent('Task 1');
      expect(taskHeadings[1]).toHaveTextContent('Task 2');
      expect(taskHeadings[2]).toHaveTextContent('Task 3');
    });

    it('should keep tasks without due dates last in ascending order', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Sort by due date
      await user.click(screen.getByRole('button', { name: /sort by due date/i }));
      
      // Toggle to ascending order
      await user.click(screen.getByRole('button', { name: /toggle sort order/i }));

      const taskHeadings = screen.getAllByRole('heading', { level: 3 });
      // Asc order: Task 2 (2025-11-30) earliest first, Task 1 (2025-12-31) later second, Task 3 (no due date) always last
      expect(taskHeadings[0]).toHaveTextContent('Task 2');
      expect(taskHeadings[1]).toHaveTextContent('Task 1');
      expect(taskHeadings[2]).toHaveTextContent('Task 3');
    });

    it('should sort tasks by priority when priority button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      await user.click(screen.getByRole('button', { name: /sort by priority/i }));

      const taskHeadings = screen.getAllByRole('heading', { level: 3 });
      // Desc order with priority puts low first (due to negation in sort logic)
      expect(taskHeadings[0]).toHaveTextContent('Task 3'); // low
      expect(taskHeadings[1]).toHaveTextContent('Task 2'); // medium
      expect(taskHeadings[2]).toHaveTextContent('Task 1'); // high
    });

    it('should sort tasks by title when title button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      await user.click(screen.getByRole('button', { name: /sort by title/i }));

      const taskHeadings = screen.getAllByRole('heading', { level: 3 });
      // Alphabetical desc order (Z to A)
      expect(taskHeadings[0]).toHaveTextContent('Task 3');
      expect(taskHeadings[1]).toHaveTextContent('Task 2');
      expect(taskHeadings[2]).toHaveTextContent('Task 1');
    });

    it('should toggle sort order from desc to asc', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Default is desc (newest first)
      let taskHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(taskHeadings[0]).toHaveTextContent('Task 3');

      // Toggle to asc (oldest first)
      await user.click(screen.getByRole('button', { name: /toggle sort order/i }));

      taskHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(taskHeadings[0]).toHaveTextContent('Task 1');
      expect(taskHeadings[1]).toHaveTextContent('Task 2');
      expect(taskHeadings[2]).toHaveTextContent('Task 3');
    });

    it('should toggle sort order from asc back to desc', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Toggle to asc
      await user.click(screen.getByRole('button', { name: /toggle sort order/i }));
      
      // Toggle back to desc
      await user.click(screen.getByRole('button', { name: /toggle sort order/i }));

      const taskHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(taskHeadings[0]).toHaveTextContent('Task 3');
    });

    it('should display correct sort order button label', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Default is desc
      expect(screen.getByRole('button', { name: /toggle sort order, currently descending/i })).toHaveTextContent('↓ Desc');

      // Toggle to asc
      await user.click(screen.getByRole('button', { name: /toggle sort order/i }));
      expect(screen.getByRole('button', { name: /toggle sort order, currently ascending/i })).toHaveTextContent('↑ Asc');
    });

    it('should highlight active sort button', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      const createdDateButton = screen.getByRole('button', { name: /sort by created date/i });
      const priorityButton = screen.getByRole('button', { name: /sort by priority/i });

      // Created date is active by default
      expect(createdDateButton).toHaveClass('bg-blue-500', 'text-white');
      expect(createdDateButton).toHaveAttribute('aria-pressed', 'true');

      // Click priority
      await user.click(priorityButton);

      // Priority should now be active
      expect(priorityButton).toHaveClass('bg-blue-500', 'text-white');
      expect(priorityButton).toHaveAttribute('aria-pressed', 'true');
      expect(createdDateButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Empty States', () => {
    it('should display "No tasks yet" message when tasks array is empty', () => {
      render(
        <TaskList
          tasks={[]}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
      expect(screen.getByText(/click "add new task" to create your first task!/i)).toBeInTheDocument();
    });

    it('should display "No tasks match" message when search yields no results', () => {
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery="nonexistent task"
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByText(/no tasks match "nonexistent task"/i)).toBeInTheDocument();
      expect(screen.getByText(/try a different search term/i)).toBeInTheDocument();
    });

    it('should display "No tasks with status" message when filter yields no results', () => {
      const onlyTodoTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description',
          status: 'todo',
          priority: 'medium',
          createdAt: '2025-01-01',
          tags: [],
        },
      ];

      render(
        <TaskList
          tasks={onlyTodoTasks}
          filter="done"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.getByText(/no tasks with status: done/i)).toBeInTheDocument();
      expect(screen.getByText(/try a different filter or create a new task/i)).toBeInTheDocument();
    });

    it('should not render sorting controls when there are no tasks to display', () => {
      render(
        <TaskList
          tasks={[]}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      expect(screen.queryByRole('button', { name: /sort by created date/i })).not.toBeInTheDocument();
    });
  });

  describe('Task Card Integration', () => {
    it('should pass onUpdateTask to TaskCard', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Find and click the "Change Status" button on the first task
      const taskCards = screen.getAllByRole('button', { name: /change status/i });
      await user.click(taskCards[0]);

      expect(mockOnUpdateTask).toHaveBeenCalled();
    });

    it('should pass onDeleteTask to TaskCard', async () => {
      const user = userEvent.setup();
      render(
        <TaskList
          tasks={mockTasks}
          filter="all"
          searchQuery=""
          onUpdateTask={mockOnUpdateTask}
          onDeleteTask={mockOnDeleteTask}
        />
      );

      // Find and click the "Delete" button on the first task
      const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
      await user.click(deleteButtons[0]);

      expect(mockOnDeleteTask).toHaveBeenCalled();
    });
  });
});
