import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Dashboard } from './Dashboard';
import { Task } from '../types/task';

describe('Dashboard', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should render empty state when no tasks exist', () => {
      render(<Dashboard tasks={[]} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first task to see analytics')).toBeInTheDocument();
    });

    it('should show zero metrics when no tasks exist', () => {
      render(<Dashboard tasks={[]} onFilterChange={mockOnFilterChange} />);

      const metricsRegion = screen.getByRole('region', { name: /dashboard metrics/i });
      expect(metricsRegion).toHaveTextContent('0'); // Total tasks
      expect(screen.getByLabelText('0 percent completion rate')).toBeInTheDocument();
      expect(screen.getByLabelText('0 overdue tasks')).toBeInTheDocument();
    });

    it('should not render chart when no tasks exist', () => {
      render(<Dashboard tasks={[]} onFilterChange={mockOnFilterChange} />);

      expect(screen.queryByText('Task Status Distribution')).not.toBeInTheDocument();
    });
  });

  describe('Metrics Calculations', () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'todo',
        priority: 'high',
        dueDate: '2025-12-31',
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'in-progress',
        priority: 'medium',
        dueDate: '2025-11-30',
        createdAt: '2025-01-02T00:00:00.000Z',
        tags: [],
      },
      {
        id: '3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'done',
        priority: 'low',
        createdAt: '2025-01-03T00:00:00.000Z',
        tags: [],
      },
    ];

    it('should calculate total tasks correctly', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('3 total tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('3 total tasks')).toHaveTextContent('3');
    });

    it('should calculate completion rate correctly', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      // 1 done out of 3 = 33.33% -> 33%
      expect(screen.getByLabelText('33 percent completion rate')).toBeInTheDocument();
    });

    it('should calculate 100% completion rate when all tasks are done', () => {
      const allDoneTasks: Task[] = mockTasks.map((task) => ({
        ...task,
        status: 'done' as const,
      }));

      render(<Dashboard tasks={allDoneTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('100 percent completion rate')).toBeInTheDocument();
    });

    it('should calculate 0% completion rate when no tasks are done', () => {
      const noDoneTasks: Task[] = mockTasks.map((task) => ({
        ...task,
        status: 'todo' as const,
      }));

      render(<Dashboard tasks={noDoneTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('0 percent completion rate')).toBeInTheDocument();
    });

    it('should display tasks by status breakdown correctly', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      const statusCard = screen.getByText('Tasks by Status').closest('div');
      expect(statusCard).toHaveTextContent('To Do:');
      expect(statusCard).toHaveTextContent('1');
      expect(statusCard).toHaveTextContent('In Progress:');
      expect(statusCard).toHaveTextContent('1');
      expect(statusCard).toHaveTextContent('Done:');
      expect(statusCard).toHaveTextContent('1');
    });
  });

  describe('Overdue Tasks Calculation', () => {
    it('should identify overdue tasks with past due date and not done status', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const tasksWithOverdue: Task[] = [
        {
          id: '1',
          title: 'Overdue Task',
          description: 'Description',
          status: 'todo',
          priority: 'high',
          dueDate: yesterdayStr,
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
        {
          id: '2',
          title: 'Not Overdue - Done',
          description: 'Description',
          status: 'done',
          priority: 'high',
          dueDate: yesterdayStr,
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
        {
          id: '3',
          title: 'Not Overdue - Future',
          description: 'Description',
          status: 'todo',
          priority: 'high',
          dueDate: '2030-12-31',
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
      ];

      render(<Dashboard tasks={tasksWithOverdue} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('1 overdue tasks')).toBeInTheDocument();
    });

    it('should not count tasks without due date as overdue', () => {
      const tasksNoDueDate: Task[] = [
        {
          id: '1',
          title: 'No Due Date',
          description: 'Description',
          status: 'todo',
          priority: 'high',
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
      ];

      render(<Dashboard tasks={tasksNoDueDate} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('0 overdue tasks')).toBeInTheDocument();
    });

    it('should not count completed tasks as overdue even if past due date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const completedOverdueTasks: Task[] = [
        {
          id: '1',
          title: 'Completed Task',
          description: 'Description',
          status: 'done',
          priority: 'high',
          dueDate: yesterday.toISOString().split('T')[0],
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
      ];

      render(<Dashboard tasks={completedOverdueTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('0 overdue tasks')).toBeInTheDocument();
    });
  });

  describe('Chart Rendering', () => {
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
        tags: [],
      },
    ];

    it('should render chart section when tasks exist', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByText('Task Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Click on a segment to filter tasks by status')).toBeInTheDocument();
    });

    it('should render chart with proper structure', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      // Verify chart container exists
      expect(screen.getByText('Task Status Distribution')).toBeInTheDocument();
      // Recharts renders SVG elements
      const container = screen.getByText('Task Status Distribution').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Chart Interaction', () => {
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
        tags: [],
      },
      {
        id: '3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'done',
        priority: 'low',
        createdAt: '2025-01-03T00:00:00.000Z',
        tags: [],
      },
    ];

    it('should have click handlers configured on chart', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      // Verify chart is rendered (Recharts creates SVG elements)
      expect(screen.getByText('Task Status Distribution')).toBeInTheDocument();
      
      // Note: Due to Recharts implementation, the actual click handler
      // is tested via integration tests. This verifies the component renders.
      const chartContainer = screen.getByText('Click on a segment to filter tasks by status').closest('div');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
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
    ];

    it('should have proper ARIA labels on all metric cards', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('1 total tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('0 percent completion rate')).toBeInTheDocument();
      expect(screen.getByLabelText('0 overdue tasks')).toBeInTheDocument();
    });

    it('should have proper region role and label for metrics', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      const metricsRegion = screen.getByRole('region', { name: /dashboard metrics/i });
      expect(metricsRegion).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByRole('heading', { name: 'Dashboard', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Task Status Distribution', level: 3 })).toBeInTheDocument();
    });

    it('should hide decorative SVG icons from screen readers', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render with responsive grid classes', () => {
      render(<Dashboard tasks={[]} onFilterChange={mockOnFilterChange} />);

      const metricsRegion = screen.getByRole('region', { name: /dashboard metrics/i });
      expect(metricsRegion).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4');
    });
  });

  describe('Edge Cases', () => {
    it('should handle tasks with various status distributions', () => {
      const mixedTasks: Task[] = [
        { id: '1', title: 'T1', description: 'D1', status: 'todo', priority: 'high', createdAt: '2025-01-01T00:00:00.000Z', tags: [] },
        { id: '2', title: 'T2', description: 'D2', status: 'todo', priority: 'high', createdAt: '2025-01-01T00:00:00.000Z', tags: [] },
        { id: '3', title: 'T3', description: 'D3', status: 'in-progress', priority: 'high', createdAt: '2025-01-01T00:00:00.000Z', tags: [] },
        { id: '4', title: 'T4', description: 'D4', status: 'done', priority: 'high', createdAt: '2025-01-01T00:00:00.000Z', tags: [] },
        { id: '5', title: 'T5', description: 'D5', status: 'done', priority: 'high', createdAt: '2025-01-01T00:00:00.000Z', tags: [] },
        { id: '6', title: 'T6', description: 'D6', status: 'done', priority: 'high', createdAt: '2025-01-01T00:00:00.000Z', tags: [] },
      ];

      render(<Dashboard tasks={mixedTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('6 total tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('50 percent completion rate')).toBeInTheDocument();
    });

    it('should handle single task', () => {
      const singleTask: Task[] = [
        {
          id: '1',
          title: 'Only Task',
          description: 'Description',
          status: 'done',
          priority: 'high',
          createdAt: '2025-01-01T00:00:00.000Z',
          tags: [],
        },
      ];

      render(<Dashboard tasks={singleTask} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('1 total tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('100 percent completion rate')).toBeInTheDocument();
    });

    it('should handle very large numbers of tasks', () => {
      const manyTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        title: `Task ${i}`,
        description: `Description ${i}`,
        status: i % 3 === 0 ? 'done' as const : i % 2 === 0 ? 'in-progress' as const : 'todo' as const,
        priority: 'medium' as const,
        createdAt: '2025-01-01T00:00:00.000Z',
        tags: [],
      }));

      render(<Dashboard tasks={manyTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByLabelText('100 total tasks')).toBeInTheDocument();
      // 34 done tasks out of 100 = 34%
      expect(screen.getByLabelText('34 percent completion rate')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
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
    ];

    it('should render all metric card titles', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completion Rate')).toBeInTheDocument();
      expect(screen.getByText('Overdue Tasks')).toBeInTheDocument();
      expect(screen.getByText('Tasks by Status')).toBeInTheDocument();
    });

    it('should render status breakdown labels', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      const statusCard = screen.getByText('Tasks by Status').closest('div');
      expect(statusCard).toHaveTextContent('To Do:');
      expect(statusCard).toHaveTextContent('In Progress:');
      expect(statusCard).toHaveTextContent('Done:');
    });

    it('should apply correct CSS classes for styling', () => {
      render(<Dashboard tasks={mockTasks} onFilterChange={mockOnFilterChange} />);

      const metricsRegion = screen.getByRole('region', { name: /dashboard metrics/i });
      expect(metricsRegion).toHaveClass('grid', 'gap-4', 'mb-8');
    });
  });
});

