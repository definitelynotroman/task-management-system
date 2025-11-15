# Technical Test Submission Template

## Candidate Information

- **Name:** Roman Baran
- **Date:** [Submission Date]

---

## Bugs Fixed

### Bug #1: Tasks Not Persisting After Creation

**Location:** `src/hooks/useTasks.ts`

**Issue:**
The `addTask` function was updating the React state but not saving the new tasks to localStorage. When users created a task and refreshed the page, the task would disappear because it was never persisted to storage.

**Solution:**
Added `saveTasksToStorage(updatedTasks)` call after updating the state in the `addTask` function. Now when a task is created, it's both added to the state and saved to localStorage, ensuring persistence across page refreshes.

---

### Bug #2: Delete Task Not Working Correctly

**Location:** `src/hooks/useTasks.ts`

**Issue:**
The `deleteTask` function was using `splice()` to mutate the tasks array directly, but never called `setTasks()` to update the React state. This meant the task was deleted from localStorage but remained visible in the UI until a page refresh.

**Solution:**
Replaced the mutation-based approach with an immutable filter operation. Changed from `tasks.splice(taskIndex, 1)` to `tasks.filter((task) => task.id !== id)`, then properly called `setTasks(updatedTasks)` to trigger a re-render. This ensures both the UI and localStorage stay in sync.

---

### Bug #3: Case-Sensitive Search

**Location:** `src/components/TaskList.tsx`

**Issue:**
The search functionality was case-sensitive, meaning searching for "setup" would not find tasks with titles like "Setup development environment". This created a poor user experience where users had to match exact capitalization.

**Solution:**
Made the search case-insensitive by converting both the search query and task title/description to lowercase before comparison. Now users can search with any case combination and still find matching tasks.

---

### Bug #4: Due Date Not Formatted for Display

**Location:** `src/components/TaskCard.tsx`

**Issue:**
The `formatDate` function was returning raw ISO date strings (e.g., "2025-11-28") instead of human-readable dates. The function had a comment indicating it should format dates but was just returning the raw string.

**Solution:**
Implemented proper date formatting using `new Date(dateString).toLocaleDateString()`. Now due dates are displayed in a user-friendly format based on the user's locale (e.g., "28/11/2025" in UK locale).

---

### Bug #5: Missing Form Validation

**Location:** `src/components/TaskForm.tsx`

**Issue:**
Users could submit the task form with empty title or description fields. There was no client-side validation to prevent creating tasks without required information, leading to incomplete or invalid task data.

**Solution:**
Added `required` attributes to both the title input and description textarea. This leverages HTML5 form validation to prevent submission of empty fields and provides native browser validation feedback to users.

---

## Features Implemented

### Feature #1: Helper Functions Integration

**Location:** `src/components/TaskList.tsx`

**Details:**
Integrated the existing `filterTasksByStatus` helper function from `taskHelpers.ts` into the TaskList component. This replaces the inline filtering logic and promotes code reusability while maintaining the same functionality.

**Implementation Approach:**
- Imported `filterTasksByStatus` from `taskHelpers.ts`
- Replaced the inline status filtering logic with a call to the helper function when filter is not 'all'
- Added a comment noting that the helper function also sorts by createdAt desc, but this is overridden by the component's custom sorting logic that runs after filtering

---

### Feature #2: Delete Confirmation Dialog

**Location:** `src/components/TaskCard.tsx`

**Details:**
Added a confirmation dialog before deleting tasks to prevent accidental data loss. Users are now prompted with a clear message including the task title before the deletion is executed.

**Implementation Approach:**
- Modified the `handleDelete` function to show a `window.confirm()` dialog
- The confirmation message includes the task title for clarity: "Are you sure you want to delete "[task title]"? This action cannot be undone."
- The delete operation only proceeds if the user confirms the action

---

### Feature #3: Tags Functionality

**Location:** `src/components/TaskForm.tsx`

**Details:**
Implemented full tag management functionality in the TaskForm component. Users can now add, view, and remove tags when creating or editing tasks. Tags are displayed in TaskCard components and persisted with task data.

**Implementation Approach:**
- Added state management for tags array and tag input field
- Created handler functions: `handleAddTag()` (prevents duplicates), `handleRemoveTag()`, and `handleTagInputKeyDown()` (Enter key support)
- Added UI section with tag input field, "Add" button, and display of existing tags with remove buttons
- Updated form submission to include the tags array instead of an empty array
- Tags are properly initialized from `initialTask` when editing and reset when form is cleared

---

### Feature #4: Accessibility Improvements

**Location:** Multiple components (`src/components/TaskCard.tsx`, `src/components/TaskFilter.tsx`, `src/components/TaskList.tsx`, `src/app/app.tsx`)

**Details:**
Comprehensive accessibility improvements across all components to enhance screen reader support and keyboard navigation, following WCAG guidelines.

**Implementation Approach:**
- **TaskCard**: Added `role="status"` and `aria-label` to priority/status badges; added descriptive `aria-label` attributes to action buttons
- **TaskFilter**: Added screen-reader-only label for search input; added `role="group"` and `aria-label` to filter button group; added `aria-pressed` to indicate active filter state
- **TaskList**: Added `role="group"` and `aria-label` to sort controls; added `aria-pressed` to sort buttons; added descriptive `aria-label` to all sort and toggle buttons
- **App**: Added `role="status"` and `aria-live="polite"` to loading message; added `role="region"` and `aria-label` to statistics dashboard; added `aria-label` and `aria-expanded` to main action button

---

## AI Tool Usage

### Tools Used

- [ ] GitHub Copilot
- [ ] ChatGPT
- [x] Claude
- [x] Other: Cursor

---

## Testing Strategy

### Tests Written

- [ ] Unit tests for [component/function]
- [ ] Integration tests for [feature]

### Test Coverage

[Describe your testing approach and coverage]

---

## Future Improvements

The following improvements have been identified for future implementation:

- **Memoize callbacks** (`src/components/TaskFilter.tsx`): Consider using `useCallback` in parent component (`app.tsx`) for `onSearchChange` callback to prevent unnecessary re-renders and effect triggers.

- **ID generation** (`src/hooks/useTasks.ts`): In production, IDs should be generated by the backend. For local-only apps, consider using `crypto.randomUUID()` instead of `Date.now()` to avoid potential ID collisions.
