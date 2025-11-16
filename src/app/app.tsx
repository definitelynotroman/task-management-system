import { useState, useMemo, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { TaskFilter } from '../components/TaskFilter';
import { TaskStatus } from '../types/task';

export function App() {
  const { tasks, loading, addTask, updateTask, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const done = tasks.filter((t) => t.status === 'done').length;

    return {
      total,
      todo,
      inProgress,
      done,
      completionRate: total > 0 ? (done / total) * 100 : 0,
    };
  }, [tasks]);

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

        {/* Statistics Dashboard */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          role="region"
          aria-label="Task statistics"
        >
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Total Tasks</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">To Do</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.todo}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">In Progress</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stats.inProgress}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {stats.done} ({stats.completionRate.toFixed(0)}%)
            </p>
          </div>
        </div>

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

      <footer className="bg-gray-800 text-white p-4 mt-12">
        <div className="container mx-auto text-center">
          <p>Task Management System - Technical Test © 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
