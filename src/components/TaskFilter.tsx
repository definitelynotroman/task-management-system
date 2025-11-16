import { useState, useEffect } from 'react';
import { TaskStatus } from '../types/task';

interface TaskFilterProps {
  onFilterChange: (status: TaskStatus | 'all') => void;
  onSearchChange: (query: string) => void;
  activeFilter?: TaskStatus | 'all';
}

export const TaskFilter = ({
  onFilterChange,
  onSearchChange,
  activeFilter = 'all',
}: TaskFilterProps) => {
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    onSearchChange(searchInput);
  }, [searchInput, onSearchChange]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleFilterClick = (filter: TaskStatus | 'all') => {
    onFilterChange(filter);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="mb-4">
        <label htmlFor="task-search" className="sr-only">
          Search tasks
        </label>
        <input
          type="text"
          id="task-search"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search tasks by title or description"
        />
      </div>

      <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter tasks by status">
        {(['all', 'todo', 'in-progress', 'done'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeFilter === filter
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-pressed={activeFilter === filter}
            aria-label={`Filter by ${filter === 'all' ? 'all tasks' : filter}`}
          >
            {filter === 'all'
              ? 'All Tasks'
              : filter.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};
