import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Task Management Application
 * 
 * To run these tests:
 * 1. From e2e directory: npx playwright test src/task-management.spec.ts --project=chromium
 * 2. From root with config: npx playwright test --config=e2e/playwright.config.ts e2e/src/task-management.spec.ts --project=chromium
 * 3. With UI: Add --ui flag to any of the above commands
 */

test.describe('Task Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Clear localStorage to ensure clean state for each test
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    // Wait for the page to load (wait for loading message to disappear)
    await page.waitForSelector('text=Loading tasks...', { state: 'hidden' }).catch(() => {
      // If loading message doesn't appear, that's fine - page might load instantly
    });
  });

  test.describe('Task Creation Flow', () => {
    test('should navigate to homepage and verify initial state', async ({ page }) => {
      // Verify page title or header
      await expect(page.locator('h1')).toContainText('Task Management System');
      
      // Verify statistics dashboard is visible
      const statsRegion = page.getByRole('region', { name: /task statistics/i });
      await expect(statsRegion).toBeVisible();
      
      // Verify "Add New Task" button is visible
      await expect(page.getByRole('button', { name: /add new task/i })).toBeVisible();
    });

    test('should open and close task form', async ({ page }) => {
      // Click "Add New Task" button
      await page.getByRole('button', { name: /add new task/i }).click();
      
      // Verify form appears
      await expect(page.getByPlaceholder(/enter task title/i)).toBeVisible();
      await expect(page.getByPlaceholder(/enter task description/i)).toBeVisible();
      
      // Click cancel button in the form (not the main "Cancel adding new task" button)
      await page.locator('form').getByRole('button', { name: /cancel/i }).click();
      
      // Verify form is hidden
      await expect(page.getByPlaceholder(/enter task title/i)).not.toBeVisible();
    });

    test('should create a task with all fields', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /add new task/i }).click();
      
      // Fill out the form
      await page.getByPlaceholder(/enter task title/i).fill('E2E Test Task');
      await page.getByPlaceholder(/enter task description/i).fill('This is a test task created in E2E test');
      
      // Select status
      await page.getByRole('combobox', { name: /status/i }).selectOption('in-progress');
      
      // Select priority
      await page.getByRole('combobox', { name: /priority/i }).selectOption('high');
      
      // Set due date (format: YYYY-MM-DD)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = tomorrow.toISOString().split('T')[0];
      // Use the input field specifically (not the sort button)
      await page.locator('input#dueDate').fill(dueDate);
      
      // Add tags - use the tag input's parent div to find the Add button
      const tagInput = page.getByPlaceholder(/enter a tag/i);
      await tagInput.fill('e2e');
      // Find the Add button in the same flex container as the tag input
      await page.locator('input#tags').locator('..').getByRole('button', { name: 'Add', exact: true }).click();
      await tagInput.fill('testing');
      await page.locator('input#tags').locator('..').getByRole('button', { name: 'Add', exact: true }).click();
      
      // Submit the form
      await page.getByRole('button', { name: /add task/i }).click();
      
      // Verify form closes
      await expect(page.getByPlaceholder(/enter task title/i)).not.toBeVisible();
      
      // Verify task appears in the list and get its card
      const taskHeading = page.getByRole('heading', { name: /e2e test task/i });
      await expect(taskHeading).toBeVisible();
      
      // Scope all assertions to the task card containing this heading
      const taskCard = taskHeading.locator('..').locator('..');
      
      // Verify task details within the specific task card
      await expect(taskCard.getByText(/this is a test task created in e2e test/i)).toBeVisible();
      await expect(taskCard.getByText(/in-progress/i)).toBeVisible();
      await expect(taskCard.getByText(/high/i)).toBeVisible();
      // Tags are displayed with # prefix
      await expect(taskCard.getByText(/#e2e/i)).toBeVisible();
      await expect(taskCard.getByText(/#testing/i)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      // Open form
      await page.getByRole('button', { name: /add new task/i }).click();
      
      // Try to submit without filling required fields
      await page.getByRole('button', { name: /add task/i }).click();
      
      // Verify form is still visible (validation prevented submission)
      await expect(page.getByPlaceholder(/enter task title/i)).toBeVisible();
      
      // Fill only title
      await page.getByPlaceholder(/enter task title/i).fill('Title only');
      await page.getByRole('button', { name: /add task/i }).click();
      
      // Verify form is still visible (description is required)
      await expect(page.getByPlaceholder(/enter task description/i)).toBeVisible();
    });

    test('should update statistics when task is created', async ({ page }) => {
      // Get initial statistics
      const statsRegion = page.getByRole('region', { name: /task statistics/i });
      const initialTotal = await statsRegion.getByText(/total tasks/i).locator('..').getByText(/\d+/).textContent();
      const initialTotalNum = parseInt(initialTotal || '0', 10);
      
      // Create a task
      await page.getByRole('button', { name: /add new task/i }).click();
      await page.getByPlaceholder(/enter task title/i).fill('Stats Test Task');
      await page.getByPlaceholder(/enter task description/i).fill('Description');
      await page.getByRole('button', { name: /add task/i }).click();
      
      // Wait for task to appear
      await expect(page.getByRole('heading', { name: /stats test task/i })).toBeVisible();
      
      // Verify statistics updated
      const newTotal = await statsRegion.getByText(/total tasks/i).locator('..').getByText(/\d+/).textContent();
      const newTotalNum = parseInt(newTotal || '0', 10);
      expect(newTotalNum).toBe(initialTotalNum + 1);
    });
  });

  test.describe('Task Filtering', () => {
    test.beforeEach(async ({ page }) => {
      // Create test tasks with different statuses
      const createTask = async (title: string, status: string) => {
        await page.getByRole('button', { name: /add new task/i }).click();
        await page.getByPlaceholder(/enter task title/i).fill(title);
        await page.getByPlaceholder(/enter task description/i).fill('Description');
        await page.getByRole('combobox', { name: /status/i }).selectOption(status);
        await page.getByRole('button', { name: /add task/i }).click();
        await expect(page.getByPlaceholder(/enter task title/i)).not.toBeVisible();
      };
      
      await createTask('Todo Task', 'todo');
      await createTask('In Progress Task', 'in-progress');
      await createTask('Done Task', 'done');
    });

    test('should filter by All Tasks', async ({ page }) => {
      await page.getByRole('button', { name: /filter by all/i }).click();
      
      // Verify all tasks are visible
      await expect(page.getByRole('heading', { name: /todo task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /in progress task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /done task/i })).toBeVisible();
    });

    test('should filter by TODO status', async ({ page }) => {
      await page.getByRole('button', { name: /filter by todo/i }).click();
      
      // Verify only TODO task is visible
      await expect(page.getByRole('heading', { name: /todo task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /in progress task/i })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: /done task/i })).not.toBeVisible();
    });

    test('should filter by In Progress status', async ({ page }) => {
      await page.getByRole('button', { name: /filter by in-progress/i }).click();
      
      // Verify only In Progress task is visible
      await expect(page.getByRole('heading', { name: /in progress task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /todo task/i })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: /done task/i })).not.toBeVisible();
    });

    test('should filter by Done status', async ({ page }) => {
      await page.getByRole('button', { name: /filter by done/i }).click();
      
      // Verify only Done task is visible
      await expect(page.getByRole('heading', { name: /done task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /todo task/i })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: /in progress task/i })).not.toBeVisible();
    });
  });

  test.describe('Task Searching', () => {
    test.beforeEach(async ({ page }) => {
      // Create test tasks
      const createTask = async (title: string, description: string) => {
        await page.getByRole('button', { name: /add new task/i }).click();
        await page.getByPlaceholder(/enter task title/i).fill(title);
        await page.getByPlaceholder(/enter task description/i).fill(description);
        await page.getByRole('button', { name: /add task/i }).click();
        await expect(page.getByPlaceholder(/enter task title/i)).not.toBeVisible();
      };
      
      await createTask('Alpha Task', 'First description');
      await createTask('Beta Task', 'Second description');
      await createTask('Gamma Task', 'Third description');
    });

    test('should search tasks by title', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search tasks/i);
      await searchInput.fill('Alpha');
      
      // Verify only matching task is visible
      await expect(page.getByRole('heading', { name: /alpha task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /beta task/i })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: /gamma task/i })).not.toBeVisible();
    });

    test('should search tasks by description', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search tasks/i);
      await searchInput.fill('Second');
      
      // Verify only matching task is visible
      await expect(page.getByRole('heading', { name: /beta task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /alpha task/i })).not.toBeVisible();
      await expect(page.getByRole('heading', { name: /gamma task/i })).not.toBeVisible();
    });

    test('should perform case-insensitive search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search tasks/i);
      await searchInput.fill('ALPHA');
      
      // Verify case-insensitive match works
      await expect(page.getByRole('heading', { name: /alpha task/i })).toBeVisible();
    });

    test('should show no results message when search yields no matches', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search tasks/i);
      await searchInput.fill('Nonexistent');
      
      // Verify no tasks message
      await expect(page.getByText(/no tasks match/i)).toBeVisible();
    });

    test('should clear search and show all tasks', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search tasks/i);
      await searchInput.fill('Alpha');
      await expect(page.getByRole('heading', { name: /alpha task/i })).toBeVisible();
      
      // Clear search
      await searchInput.clear();
      
      // Verify all tasks are visible again
      await expect(page.getByRole('heading', { name: /alpha task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /beta task/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /gamma task/i })).toBeVisible();
    });
  });
});

