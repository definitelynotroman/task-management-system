import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onUpdate, onDelete }: TaskCardProps) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  const handleStatusToggle = () => {
    const statuses: Task['status'][] = ['todo', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];
    onUpdate(task.id, { status: nextStatus });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return dateString; // Should format to readable date
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
        <h3 className="text-lg font-semibold text-gray-800 wrap-break-word">
          {task.title}
        </h3>
        <div className="flex gap-2 flex-wrap">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              priorityColors[task.priority]
            }`}
          >
            {task.priority}
          </span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              statusColors[task.status]
            }`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-3">{task.description}</p>

      <div className="text-sm text-gray-500 mb-3">
        <p>Due: {formatDate(task.dueDate)}</p>
        <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex gap-2 flex-wrap">
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-col sm:flex-row">
        <button
          onClick={handleStatusToggle}
          className="flex-1 bg-blue-500 text-white py-2 sm:py-1 px-3 rounded text-sm hover:bg-blue-600 transition-colors min-h-11 sm:min-h-0"
        >
          Change Status
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white py-2 sm:py-1 px-3 rounded text-sm hover:bg-red-600 transition-colors min-h-11 sm:min-h-0"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
