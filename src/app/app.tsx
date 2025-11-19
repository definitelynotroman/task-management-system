import { useState, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskFilter } from '../components/TaskFilter';
import { Dashboard } from '../components/Dashboard';
import { TaskStatus } from '../types/task';

export function App() {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Task Management System</h1>
          <p className="text-blue-100 mt-2">
            Organize and track your tasks efficiently
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div
            className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4"
            role="status"
            aria-live="polite"
          >
            <p>Loading tasks...</p>
          </div>
        )}

        {/* Dashboard */}
        <Dashboard tasks={tasks} onFilterChange={setFilter} />

        {/* Add Task Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
            aria-label={showForm ? 'Cancel adding new task' : 'Add new task'}
            aria-expanded={showForm}
          >
            {showForm ? 'Cancel' : '+ Add New Task'}
          </button>
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="mb-6">
            <TaskForm
              onSubmit={(task) => {
                addTask(task);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Filter */}
        <TaskFilter
          onFilterChange={setFilter}
          onSearchChange={handleSearchChange}
          activeFilter={filter}
        />

        {/* Task List */}
        <TaskList
          tasks={tasks}
          filter={filter}
          searchQuery={searchQuery}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-12" role="contentinfo">
        <div className="container mx-auto text-center">
          <p>Task Management System - Technical Test © 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
