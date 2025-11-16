import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { TaskFilter } from './TaskFilter';

describe('TaskFilter', () => {
  const mockOnFilterChange = vi.fn();
  const mockOnSearchChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should render all filter buttons', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    expect(screen.getByRole('button', { name: /filter by all tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter by todo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter by in-progress/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter by done/i })).toBeInTheDocument();
  });

  it('should have proper accessibility attributes on search input', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    expect(searchInput).toHaveAttribute('aria-label', 'Search tasks by title or description');
    expect(searchInput).toHaveAttribute('id', 'task-search');
    
    // Check for sr-only label
    const label = screen.getByLabelText(/search tasks/i, { selector: 'input' });
    expect(label).toBeInTheDocument();
  });

  it('should have proper accessibility attributes on filter buttons', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
        activeFilter="todo"
      />
    );

    const allButton = screen.getByRole('button', { name: /filter by all tasks/i });
    const todoButton = screen.getByRole('button', { name: /filter by todo/i });

    expect(allButton).toHaveAttribute('aria-pressed', 'false');
    expect(todoButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should highlight active filter button with "all" as default', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const allButton = screen.getByRole('button', { name: /filter by all tasks/i });
    expect(allButton).toHaveClass('bg-blue-500', 'text-white');
    expect(allButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should highlight the correct active filter button when provided', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
        activeFilter="in-progress"
      />
    );

    const inProgressButton = screen.getByRole('button', { name: /filter by in-progress/i });
    expect(inProgressButton).toHaveClass('bg-blue-500', 'text-white');
    expect(inProgressButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onSearchChange when user types in search input', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    await user.type(searchInput, 'test query');

    // Wait for the useEffect to trigger
    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('test query');
    });
  });

  it('should update search input value as user types', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tasks/i) as HTMLInputElement;
    await user.type(searchInput, 'important task');

    expect(searchInput).toHaveValue('important task');
  });

  it('should call onSearchChange with empty string when search is cleared', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    
    // Type something
    await user.type(searchInput, 'test');
    
    // Clear it
    await user.clear(searchInput);

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('');
    });
  });

  it('should call onFilterChange with "all" when All Tasks button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const allButton = screen.getByRole('button', { name: /filter by all tasks/i });
    await user.click(allButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('all');
  });

  it('should call onFilterChange with "todo" when TO DO button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const todoButton = screen.getByRole('button', { name: /filter by todo/i });
    await user.click(todoButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('todo');
  });

  it('should call onFilterChange with "in-progress" when IN PROGRESS button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const inProgressButton = screen.getByRole('button', { name: /filter by in-progress/i });
    await user.click(inProgressButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('in-progress');
  });

  it('should call onFilterChange with "done" when DONE button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const doneButton = screen.getByRole('button', { name: /filter by done/i });
    await user.click(doneButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith('done');
  });

  it('should display correct button labels', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    expect(screen.getByRole('button', { name: /filter by all tasks/i })).toHaveTextContent('All Tasks');
    expect(screen.getByRole('button', { name: /filter by todo/i })).toHaveTextContent('TODO');
    expect(screen.getByRole('button', { name: /filter by in-progress/i })).toHaveTextContent('IN PROGRESS');
    expect(screen.getByRole('button', { name: /filter by done/i })).toHaveTextContent('DONE');
  });

  it('should have filter buttons group with proper role and aria-label', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    const buttonGroup = screen.getByRole('group', { name: /filter tasks by status/i });
    expect(buttonGroup).toBeInTheDocument();
  });

  it('should call onSearchChange on initial render with empty string', () => {
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    // useEffect should call onSearchChange on mount
    expect(mockOnSearchChange).toHaveBeenCalledWith('');
  });

  it('should handle multiple filter changes', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    // Click todo
    await user.click(screen.getByRole('button', { name: /filter by todo/i }));
    expect(mockOnFilterChange).toHaveBeenCalledWith('todo');

    // Click done
    await user.click(screen.getByRole('button', { name: /filter by done/i }));
    expect(mockOnFilterChange).toHaveBeenCalledWith('done');

    // Click all
    await user.click(screen.getByRole('button', { name: /filter by all tasks/i }));
    expect(mockOnFilterChange).toHaveBeenCalledWith('all');

    expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
  });

  it('should handle both search and filter interactions together', async () => {
    const user = userEvent.setup();
    render(
      <TaskFilter
        onFilterChange={mockOnFilterChange}
        onSearchChange={mockOnSearchChange}
      />
    );

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search tasks/i);
    await user.type(searchInput, 'urgent');

    // Click filter
    await user.click(screen.getByRole('button', { name: /filter by todo/i }));

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalledWith('urgent');
    });
    expect(mockOnFilterChange).toHaveBeenCalledWith('todo');
  });
});
