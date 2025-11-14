# Frontend Technical Test - Task Management Application

## Overview

Welcome to our Frontend Technical Assessment! This test is designed to evaluate your skills in:

- **React Development** (React 19)
- **Web Engineering Best Practices**
- **Problem Solving & Debugging**
- **Use of AI Tools** (GitHub Copilot, ChatGPT, etc.)
- **Code Quality & Architecture**

You'll be working with a Task Management application built with **NX**, **React 19**, **TypeScript**, and **TailwindCSS**. The application has several intentional bugs and missing features that you'll need to identify and fix.

Feel free to use AI tools (GitHub Copilot, ChatGPT, Claude, etc.) to help you complete the tasks. We want to see how effectively you can leverage modern development tools.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run tests
npm test

```

The application will be available at `http://localhost:4200`

## Project Structure

```
candidate-test/
├── src/
│   ├── app/
│   │   └── app.tsx              # Main application component
│   ├── components/
│   │   ├── TaskCard.tsx         # Individual task card component
│   │   ├── TaskFilter.tsx       # Filter and search component
│   │   ├── TaskForm.tsx         # Form for creating/editing tasks
│   │   └── TaskList.tsx         # List view of tasks
│   ├── hooks/
│   │   └── useTasks.ts          # Custom hook for task management
│   ├── types/
│   │   └── task.ts              # TypeScript type definitions
│   └── utils/
│       ├── taskHelpers.ts       # Helper functions
│       └── seedData.ts          # Sample data for testing
```

## Submission Guidelines

### What to Submit

1. **Completed Code** - Your fixed and improved version of the application
2. **SUBMISSION.md** - A markdown file containing:
   - List of bugs you fixed with explanations
   - Features you implemented
   - Improvements you made
   - How you used AI tools
   - Additional suggestions for improvement
   - Approximate time spent

### Submission Format

You can submit your work in one of the following ways:

1. **GitHub Repository** - Fork this repository and submit a pull request
2. **Zip File** - Send a zip file of the completed project (exclude node_modules)

## Sample SUBMISSION.md Template

```markdown
# Technical Test Submission

## Candidate Information

- Name: [Your Name]
- Date: [Submission Date]

## Bugs Fixed

### Bug #1: Bug in form

**Location:** `src/utils/taskHelpers.ts`
**Issue:** details of the issue
**Solution:** [Your explanation]

[Continue for each bug...]

## Features Implemented

### Feature #1: Missing feature

**Details:** [Your explanation]
**Implementation Approach:** [Your approach]

[Continue for each feature...]

## AI Tool Usage

- [ ] GitHub Copilot
- [ ] ChatGPT
- [ ] Claude
- [ ] Other: [Specify]

---

## Testing Strategy

### Tests Written

- [ ] Unit tests for [component/function]
- [ ] Integration tests for [feature]

### Test Coverage

[Describe your testing approach and coverage]
```

## Questions?

If you have any questions about the requirements or encounter any issues with the setup, please don't hesitate to reach out.
