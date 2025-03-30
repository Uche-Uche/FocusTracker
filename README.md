# 30-Day Focused Task Manager

A minimalist task management web application designed to enhance productivity through intuitive organization and engaging user experience. This application helps you manage 6 key activities over a 30-day period, with support for both daily and weekly tasks.

## Features

- **Task Management**: Create, view, update, and delete tasks with detailed information
- **Category System**: Organize tasks with customizable categories (create, edit, and delete)
- **Progress Tracking**: Monitor daily and weekly task completion progress
- **Subtask Support**: Break down complex tasks into manageable subtasks
- **Nordic-inspired Design**: Clean, distraction-free interface for maximum focus

## Tech Stack

- **Frontend**: React with TypeScript
- **UI Components**: ShadCN UI library with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Backend**: Express.js RESTful API
- **Database**: In-memory storage (can be extended to use PostgreSQL)

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/30-day-focused-task-manager.git
cd 30-day-focused-task-manager
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

## Project Structure

- `/client`: React frontend application
  - `/src/components`: UI components
  - `/src/pages`: Page components
  - `/src/lib`: Utility functions
  - `/src/hooks`: Custom React hooks
- `/server`: Express.js backend
  - `index.ts`: Main server entry point
  - `routes.ts`: API route definitions
  - `storage.ts`: Data storage implementation
- `/shared`: Shared code between frontend and backend
  - `schema.ts`: Data models and type definitions

## API Endpoints

The application provides the following API endpoints:

- **Tasks**
  - `GET /api/tasks` - Get all tasks
  - `GET /api/tasks/:id` - Get a specific task
  - `GET /api/tasks/frequency/:frequency` - Get tasks by frequency
  - `POST /api/tasks` - Create a new task
  - `PATCH /api/tasks/:id` - Update a task
  - `DELETE /api/tasks/:id` - Delete a task

- **Categories**
  - `GET /api/categories` - Get all categories
  - `GET /api/categories/:id` - Get a specific category
  - `POST /api/categories` - Create a new category
  - `PATCH /api/categories/:id` - Update a category
  - `DELETE /api/categories/:id` - Delete a category

- **Subtasks**
  - `PATCH /api/subtasks/:id` - Update a subtask

## License

This project is licensed under the MIT License - see the LICENSE file for details.