import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { TaskForm } from './TaskForm';
import { Task } from '../types/task';

describe('TaskForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with all fields', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
  });

  it('should have required attributes on title and description fields', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    expect(titleInput).toBeRequired();
    expect(descriptionInput).toBeRequired();
  });

  it('should display "Add Task" button when no initialTask is provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('should display "Update Task" button when initialTask is provided', () => {
    const initialTask: Task = {
      id: '1',
      title: 'Test',
      description: 'Test',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-01-01',
      tags: [],
    };

    render(<TaskForm onSubmit={mockOnSubmit} initialTask={initialTask} />);

    expect(
      screen.getByRole('button', { name: /update task/i })
    ).toBeInTheDocument();
  });

  it('should populate form fields when initialTask is provided', () => {
    const initialTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-12-31',
      createdAt: '2025-01-01',
      tags: ['urgent', 'important'],
    };

    render(<TaskForm onSubmit={mockOnSubmit} initialTask={initialTask} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Task');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/status/i)).toHaveValue('in-progress');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('high');
    expect(screen.getByLabelText(/due date/i)).toHaveValue('2025-12-31');
    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(screen.getByText('#important')).toBeInTheDocument();
  });

  it('should call onSubmit with correct data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'Task Description');
    await user.selectOptions(screen.getByLabelText(/status/i), 'in-progress');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    await user.type(screen.getByLabelText(/due date/i), '2025-12-31');

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'Task Description',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-12-31',
      tags: [],
    });
  });

  it('should reset form after submission', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'Task Description');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/status/i)).toHaveValue('todo');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('medium');
  });

  it('should add tag when Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'urgent');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });

  it('should add tag when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'urgent');
    await user.keyboard('{Enter}');

    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });

  it('should prevent duplicate tags', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByLabelText(/tags/i);
    
    // Add first tag
    await user.type(tagInput, 'urgent');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    // Try to add duplicate
    await user.type(tagInput, 'urgent');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    // Should only have one instance
    const tags = screen.getAllByText('#urgent');
    expect(tags).toHaveLength(1);
  });

  it('should trim whitespace from tags', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, '  urgent  ');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.getByText('#urgent')).toBeInTheDocument();
  });

  it('should not add empty tags', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, '   ');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.queryByText(/#/)).not.toBeInTheDocument();
  });

  it('should remove tag when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    // Add a tag
    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'urgent');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.getByText('#urgent')).toBeInTheDocument();

    // Remove the tag
    const removeButton = screen.getByRole('button', { name: /remove tag urgent/i });
    await user.click(removeButton);

    expect(screen.queryByText('#urgent')).not.toBeInTheDocument();
  });

  it('should include tags in form submission', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'Task');
    await user.type(screen.getByLabelText(/description/i), 'Description');

    // Add tags
    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'urgent');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    await user.type(tagInput, 'important');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: ['urgent', 'important'],
      })
    );
  });

  it('should render Cancel button when onCancel is provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should not render Cancel button when onCancel is not provided', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(
      screen.queryByRole('button', { name: /cancel/i })
    ).not.toBeInTheDocument();
  });

  it('should call onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should have default values for status and priority', () => {
    render(<TaskForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/status/i)).toHaveValue('todo');
    expect(screen.getByLabelText(/priority/i)).toHaveValue('medium');
  });

  it('should not submit form without required fields', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /add task/i }));

    // onSubmit should not be called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should handle dueDate as undefined when not provided', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'Task');
    await user.type(screen.getByLabelText(/description/i), 'Description');

    await user.click(screen.getByRole('button', { name: /add task/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        dueDate: undefined,
      })
    );
  });
});
