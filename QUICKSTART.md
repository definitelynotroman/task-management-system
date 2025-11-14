# Quick Start Guide for Candidates

## Welcome! 👋

This guide will help you get started with the technical test quickly.

## Setup

### 1. Clone or Download the Project

```bash
# If using Git
git clone [repository-url]
cd candidate-test

# Or extract the ZIP file and navigate to the folder
cd candidate-test
```

### 2. Install Dependencies

```bash
npm install
```

This will install:

- React 19
- TypeScript
- TailwindCSS
- NX build tools
- Testing libraries

### 3. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:4200`

### 4. Verify the Setup

## Understanding the Application

### What It Does

The Task Management System allows users to:

- Create tasks with titles, descriptions, priorities, and due dates
- Filter tasks by status (To Do, In Progress, Done)
- Search for tasks
- Update task status
- Delete tasks
- View statistics about tasks

### Current State

⚠️ **The app has bugs!** That's intentional. Your job is to find and fix them.

## Project Structure Quick Reference

```
src/
├── app/
│   └── app.tsx           # Main app - start here!
├── components/
│   ├── TaskCard.tsx      # Individual task display
│   ├── TaskFilter.tsx    # Search and filters
│   ├── TaskForm.tsx      # Create/edit form
│   └── TaskList.tsx      # List of tasks
├── hooks/
│   └── useTasks.ts       # State management - bugs here!
├── types/
│   └── task.ts           # TypeScript types
├── utils/
│   └── taskHelpers.ts    # Helper functions - check here!
└── styles.css            # Global styles (TailwindCSS)
```
