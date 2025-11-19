# Frontend Technical Test - Complete Package

## 🎯 Test Overview

#### 1. Find and fix bugs for existing features. Ensuring that correct accessibiliity aria labels/roles are used.

#### 2. Add relevant tests for TaskCard, TaskFilter, TaskForm, TaskList, and app

#### 3. Create a new dashboard

---

## 🎯 Dashboard

**Goal:** Add a simple analytics dashboard to visualize task data.

#### 1. Key Metrics Cards

Display 4-5 metric cards showing:

- Total tasks
- Completion rate (%)
- Overdue tasks count
- Tasks by status breakdown

#### 2. Single Interactive Chart

Implement ONE of these charts:

**Option A: Task Status Distribution (Donut/Pie Chart)**

- Visual breakdown of todo/in-progress/done
- Show counts and percentages
- Click segment to filter the main task list

**Option B: Completion Trend (Line Chart)**

- Last 7 days: tasks completed per day
- Hover to see date and count
- Responsive sizing

**Implementation Notes:**

- Use a lightweight chart library (Recharts recommended)
- Make it interactive (hover tooltips, click filtering)
- Ensure responsive design
- Add proper TypeScript types

---

## 🚀 Quick Start

### Test the Application Yourself

```bash
cd candidate-test
npm install
npm start
```

This starts the app on `http://localhost:4200`
