import { Task } from '../types/task';
import { STORAGE_KEY } from './taskHelpers';
/**
 * Seed data for testing and dashboard development
 *
 * This provides a realistic dataset with:
 * - 25 tasks across different statuses
 * - Mix of priorities (low, medium, high)
 * - Tasks created over the last 30 days
 * - Tasks with various due dates (past, present, future)
 * - Diverse tags for filtering
 *
 * Useful for testing:
 * - Dashboard metrics (completion rate, overdue tasks)
 * - Trend charts (tasks completed over time)
 * - Status distribution visualizations
 * - Search and filter functionality
 */

const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const getDateDaysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0]; // Return date only for dueDate
};

export const seedTasks: Task[] = [
  // DONE tasks (10) - for completion metrics
  {
    id: '1',
    title: 'Setup development environment',
    description: 'Install Node.js, VS Code, and configure Git',
    status: 'done',
    priority: 'high',
    dueDate: getDateDaysFromNow(-15),
    createdAt: getDateDaysAgo(20),
    tags: ['setup', 'development'],
  },
  {
    id: '2',
    title: 'Create project documentation',
    description: 'Write README and setup instructions',
    status: 'done',
    priority: 'medium',
    dueDate: getDateDaysFromNow(-10),
    createdAt: getDateDaysAgo(18),
    tags: ['documentation'],
  },
  {
    id: '3',
    title: 'Design database schema',
    description: 'Plan tables and relationships for user data',
    status: 'done',
    priority: 'high',
    dueDate: getDateDaysFromNow(-8),
    createdAt: getDateDaysAgo(15),
    tags: ['database', 'design'],
  },
  {
    id: '4',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality',
    status: 'done',
    priority: 'high',
    dueDate: getDateDaysFromNow(-5),
    createdAt: getDateDaysAgo(12),
    tags: ['authentication', 'security'],
  },
  {
    id: '5',
    title: 'Write unit tests for API',
    description: 'Add test coverage for all endpoints',
    status: 'done',
    priority: 'medium',
    dueDate: getDateDaysFromNow(-3),
    createdAt: getDateDaysAgo(10),
    tags: ['testing', 'api'],
  },
  {
    id: '6',
    title: 'Code review session',
    description: 'Review pull requests from team members',
    status: 'done',
    priority: 'low',
    createdAt: getDateDaysAgo(8),
    tags: ['review', 'teamwork'],
  },
  {
    id: '7',
    title: 'Fix responsive design issues',
    description: 'Ensure mobile compatibility across all pages',
    status: 'done',
    priority: 'medium',
    dueDate: getDateDaysFromNow(-2),
    createdAt: getDateDaysAgo(7),
    tags: ['frontend', 'mobile', 'bug'],
  },
  {
    id: '8',
    title: 'Update dependencies',
    description: 'Upgrade packages to latest stable versions',
    status: 'done',
    priority: 'low',
    createdAt: getDateDaysAgo(6),
    tags: ['maintenance'],
  },
  {
    id: '9',
    title: 'Deploy to staging environment',
    description: 'Push latest changes to staging server',
    status: 'done',
    priority: 'high',
    dueDate: getDateDaysFromNow(-1),
    createdAt: getDateDaysAgo(5),
    tags: ['deployment', 'devops'],
  },
  {
    id: '10',
    title: 'Performance optimization',
    description: 'Optimize database queries and caching',
    status: 'done',
    priority: 'medium',
    createdAt: getDateDaysAgo(4),
    tags: ['performance', 'optimization'],
  },

  // IN-PROGRESS tasks (8) - for active work metrics
  {
    id: '11',
    title: 'Build analytics dashboard',
    description: 'Create charts and metrics for user insights',
    status: 'in-progress',
    priority: 'high',
    dueDate: getDateDaysFromNow(3),
    createdAt: getDateDaysAgo(3),
    tags: ['dashboard', 'analytics', 'frontend'],
  },
  {
    id: '12',
    title: 'Implement real-time notifications',
    description: 'Add WebSocket support for live updates',
    status: 'in-progress',
    priority: 'medium',
    dueDate: getDateDaysFromNow(5),
    createdAt: getDateDaysAgo(3),
    tags: ['websocket', 'notifications'],
  },
  {
    id: '13',
    title: 'Add accessibility features',
    description: 'Ensure WCAG 2.1 AA compliance',
    status: 'in-progress',
    priority: 'high',
    dueDate: getDateDaysFromNow(4),
    createdAt: getDateDaysAgo(2),
    tags: ['accessibility', 'a11y'],
  },
  {
    id: '14',
    title: 'Refactor authentication module',
    description: 'Clean up code and improve security',
    status: 'in-progress',
    priority: 'medium',
    createdAt: getDateDaysAgo(2),
    tags: ['refactoring', 'security'],
  },
  {
    id: '15',
    title: 'Create user onboarding flow',
    description: 'Design and implement guided tour for new users',
    status: 'in-progress',
    priority: 'low',
    dueDate: getDateDaysFromNow(10),
    createdAt: getDateDaysAgo(1),
    tags: ['ux', 'onboarding'],
  },
  {
    id: '16',
    title: 'Integrate payment gateway',
    description: 'Add Stripe payment processing',
    status: 'in-progress',
    priority: 'high',
    dueDate: getDateDaysFromNow(7),
    createdAt: getDateDaysAgo(1),
    tags: ['payment', 'integration'],
  },
  {
    id: '17',
    title: 'Write API documentation',
    description: 'Document all endpoints with Swagger',
    status: 'in-progress',
    priority: 'medium',
    createdAt: getDateDaysAgo(1),
    tags: ['documentation', 'api'],
  },
  {
    id: '18',
    title: 'Setup CI/CD pipeline',
    description: 'Automate testing and deployment with GitHub Actions',
    status: 'in-progress',
    priority: 'high',
    dueDate: getDateDaysFromNow(6),
    createdAt: getDateDaysAgo(1),
    tags: ['devops', 'automation'],
  },

  // TODO tasks (7) - for backlog metrics
  {
    id: '19',
    title: 'Implement dark mode',
    description: 'Add theme switcher and dark color scheme',
    status: 'todo',
    priority: 'low',
    dueDate: getDateDaysFromNow(14),
    createdAt: getDateDaysAgo(0),
    tags: ['frontend', 'ui', 'theme'],
  },
  {
    id: '20',
    title: 'Add export functionality',
    description: 'Allow users to export data as CSV/PDF',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateDaysFromNow(12),
    createdAt: getDateDaysAgo(0),
    tags: ['feature', 'export'],
  },
  {
    id: '21',
    title: 'Security audit',
    description: 'Conduct comprehensive security review',
    status: 'todo',
    priority: 'high',
    dueDate: getDateDaysFromNow(8),
    createdAt: getDateDaysAgo(0),
    tags: ['security', 'audit'],
  },
  {
    id: '22',
    title: 'Optimize images',
    description: 'Compress and lazy-load images for faster loading',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateDaysFromNow(15),
    createdAt: getDateDaysAgo(0),
    tags: ['performance', 'optimization'],
  },
  {
    id: '23',
    title: 'Add email notifications',
    description: 'Send automated emails for important events',
    status: 'todo',
    priority: 'medium',
    dueDate: getDateDaysFromNow(20),
    createdAt: getDateDaysAgo(0),
    tags: ['notifications', 'email'],
  },
  {
    id: '24',
    title: 'Create admin panel',
    description: 'Build dashboard for system administrators',
    status: 'todo',
    priority: 'low',
    createdAt: getDateDaysAgo(0),
    tags: ['admin', 'dashboard'],
  },
  {
    id: '25',
    title: 'Implement rate limiting',
    description: 'Add API rate limiting to prevent abuse',
    status: 'todo',
    priority: 'high',
    dueDate: getDateDaysFromNow(9),
    createdAt: getDateDaysAgo(0),
    tags: ['security', 'api'],
  },
];

/**
 * Helper function to load seed data into localStorage
 * Can be called from app initialization or a developer tool
 */
export const loadSeedData = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTasks));
  console.log(`✅ Loaded ${seedTasks.length} seed tasks into localStorage`);
};

/**
 * Helper function to clear all tasks from localStorage
 */
export const clearAllTasks = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️  Cleared all tasks from localStorage');
};

/**
 * Dashboard-friendly statistics from seed data:
 * - Total tasks: 25
 * - Done: 10 (40% completion rate)
 * - In Progress: 8 (32%)
 * - Todo: 7 (28%)
 * - High priority: 10
 * - Medium priority: 10
 * - Low priority: 5
 * - Tasks with tags: 25
 * - Tasks with due dates: 17
 * - Overdue tasks: 7 (created with past due dates)
 */
