import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { TaskCard } from './TaskCard';
import { Task } from '../types/task';

describe('TaskCard', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-12-31',
    createdAt: '2025-01-01T00:00:00.000Z',
    tags: ['urgent', 'important'],
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render task with correct title and description', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should display priority badge with correct text and aria-label', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const priorityBadge = screen.getByLabelText('Priority: high');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge).toHaveTextContent('high');
  });

  it('should display status badge with correct text and aria-label', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const statusBadge = screen.getByLabelText('Status: todo');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveTextContent('todo');
  });

  it('should format and display due date', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const dueDate = new Date('2025-12-31').toLocaleDateString();
    expect(screen.getByText(`Due: ${dueDate}`)).toBeInTheDocument();
  });

  it('should display "No due date" when dueDate is not provided', () => {
    const taskWithoutDueDate = { ...mockTask, dueDate: undefined };
    render(
      <TaskCard
        task={taskWithoutDueDate}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Due: No due date')).toBeInTheDocument();
  });

  it('should format and display created date', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const createdDate = new Date('2025-01-01T00:00:00.000Z').toLocaleDateString();
    expect(screen.getByText(`Created: ${createdDate}`)).toBeInTheDocument();
  });

  it('should display tags when present', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(screen.getByText('#important')).toBeInTheDocument();
  });

  it('should not display tags section when tags array is empty', () => {
    const taskWithoutTags = { ...mockTask, tags: [] };
    render(
      <TaskCard
        task={taskWithoutTags}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByText(/#/)).not.toBeInTheDocument();
  });

  it('should call onUpdate with next status when Change Status button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const changeStatusButton = screen.getByRole('button', {
      name: /change status/i,
    });
    await user.click(changeStatusButton);

    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'in-progress' });
  });

  it('should cycle through statuses correctly (todo -> in-progress -> done -> todo)', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    // From todo to in-progress
    await user.click(screen.getByRole('button', { name: /change status/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'in-progress' });

    // From in-progress to done
    const inProgressTask = { ...mockTask, status: 'in-progress' as const };
    rerender(
      <TaskCard
        task={inProgressTask}
        onUpdate={mockOnUpdate}
        onDelete={mockOnDelete}
      />
    );
    await user.click(screen.getByRole('button', { name: /change status/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'done' });

    // From done to todo
    const doneTask = { ...mockTask, status: 'done' as const };
    rerender(
      <TaskCard task={doneTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );
    await user.click(screen.getByRole('button', { name: /change status/i }));
    expect(mockOnUpdate).toHaveBeenCalledWith('1', { status: 'todo' });
  });

  it('should show confirmation dialog when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Test Task"? This action cannot be undone.'
    );
    expect(mockOnDelete).toHaveBeenCalledWith('1');

    mockConfirm.mockRestore();
  });

  it('should not call onDelete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const deleteButton = screen.getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();

    mockConfirm.mockRestore();
  });

  it('should have proper accessibility attributes on buttons', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const changeStatusButton = screen.getByRole('button', {
      name: 'Change status from todo to next status',
    });
    expect(changeStatusButton).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', {
      name: 'Delete task: Test Task',
    });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should have proper accessibility attributes on badges', () => {
    render(
      <TaskCard task={mockTask} onUpdate={mockOnUpdate} onDelete={mockOnDelete} />
    );

    const priorityBadge = screen.getByRole('status', { name: 'Priority: high' });
    expect(priorityBadge).toBeInTheDocument();

    const statusBadge = screen.getByRole('status', { name: 'Status: todo' });
    expect(statusBadge).toBeInTheDocument();
  });
});

