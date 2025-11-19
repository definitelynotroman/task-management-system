import { Task, TaskStatus } from '../types/task';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from 'recharts';

/**
 * TODO: I am aware that there are a lot of optimizations possible here:
 * - Split code into custom hooks for business logic separation (see SUBMISSION.md #13)
 * - Move interfaces to separate files for better organization
 * - Use constants/enums for colors, status values, and configuration (see SUBMISSION.md #12, #19)
 * - Extract chart configuration into separate utilities
 * - Split large component into smaller sub-components
 * For simplicity and clarity in this technical test, I kept everything in this single file.
 */

interface DashboardProps {
  tasks: Task[];
  onFilterChange: (status: TaskStatus | 'all') => void;
}

interface ChartData {
  name: string;
  value: number;
  status: TaskStatus;
  percentage: number;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export const Dashboard = ({ tasks, onFilterChange }: DashboardProps) => {
  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate overdue tasks (tasks with dueDate < today AND status !== 'done')
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'done') return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  // Tasks by status
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  // Chart data
  const chartData: ChartData[] = [
    {
      name: 'To Do',
      value: todoCount,
      status: 'todo',
      percentage: totalTasks > 0 ? (todoCount / totalTasks) * 100 : 0,
    },
    {
      name: 'In Progress',
      value: inProgressCount,
      status: 'in-progress',
      percentage: totalTasks > 0 ? (inProgressCount / totalTasks) * 100 : 0,
    },
    {
      name: 'Done',
      value: doneCount,
      status: 'done',
      percentage: totalTasks > 0 ? (doneCount / totalTasks) * 100 : 0,
    },
  ];

  // Colors for chart segments
  const COLORS = {
    todo: '#EAB308', // yellow-500
    'in-progress': '#3B82F6', // blue-500
    done: '#10B981', // green-500
  };

  // Type guard to check if data has a valid TaskStatus
  const isValidTaskStatus = (status: unknown): status is TaskStatus => {
    return status === 'todo' || status === 'in-progress' || status === 'done';
  };

  // Handle chart click
  const handleChartClick = (data: ChartData) => {
    // Recharts passes the data item from chartData array, which is ChartData
    // Access status property directly (data is typed as 'any' by Recharts)
    if (data && isValidTaskStatus(data.status)) {
      onFilterChange(data.status);
    }
  };

  // Custom label for chart
  const renderCustomLabel = (props: PieLabelRenderProps) => {
    if (props.value === 0) return null;
    // Use Recharts' built-in percent property (0-1 range) and convert to percentage
    const percentage = props.percent ? props.percent * 100 : 0;
    return `${percentage.toFixed(0)}%`;
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {/* Metrics Cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        role="region"
        aria-label="Dashboard metrics"
      >
        {/* Total Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800 mt-2" aria-label={`${totalTasks} total tasks`}>
                {totalTasks}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2" aria-label={`${completionRate.toFixed(0)} percent completion rate`}>
                {completionRate.toFixed(0)}%
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Overdue Tasks</p>
              <p className="text-3xl font-bold text-red-600 mt-2" aria-label={`${overdueTasks} overdue tasks`}>
                {overdueTasks}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tasks by Status */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-3">Tasks by Status</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">To Do:</span>
                <span className="font-semibold text-yellow-600">{todoCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">In Progress:</span>
                <span className="font-semibold text-blue-600">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Done:</span>
                <span className="font-semibold text-green-600">{doneCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      {totalTasks > 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Task Status Distribution
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Click on a segment to filter tasks by status
          </p>
          <div className="w-full h-[480px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handleChartClick}
                  className="cursor-pointer"
                  aria-label="Task status distribution chart"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.status}`}
                      fill={COLORS[entry.status]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} tasks (${props.payload.percentage.toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={60}
                  formatter={(value: string, entry: any) => {
                    const data = entry.payload as ChartData;
                    return `${value}: ${data.value} (${data.percentage.toFixed(1)}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-gray-600 text-lg font-medium">No tasks yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Create your first task to see analytics
          </p>
        </div>
      )}
    </div>
  );
};

