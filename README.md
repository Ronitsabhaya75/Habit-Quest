# HabitQuest - Gamified Habit Tracking Application

HabitQuest is a gamified habit tracking application designed to help users build positive habits through game mechanics and interactive features. The application combines the science of habit formation with game design elements to create an engaging experience that motivates users to maintain consistent routines


## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Component Structure](#component-structure)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [Gamification Elements](#gamification-elements)
- [Installation](#installation)
- [Development](#development)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)

## Overview

HabitQuest transforms the often challenging process of building habits into an engaging journey. Users create habits and daily tasks, earn experience points (XP) for completing them, level up their profiles, achieve streaks, and compete with others on the leaderboard. The application features a visually appealing space-themed UI with gamification elements throughout.

## Features

### Core Features

- **Task Management**
  - Create, update, and delete daily tasks
  - Track task completion and view history
  - Create recurring tasks with customizable frequency (daily, weekly, biweekly, monthly)

- **Habit Formation**
  - Create and monitor habits
  - Track habit streaks and consistency
  - Set reminders for habit completion

- **Calendar View**
  - Visual calendar for planning and monitoring tasks/habits
  - Date-specific task assignment and management
  - Historical view of completed activities

- **User Dashboard**
  - Performance metrics and progress visualization
  - Streak counters and level progression
  - Achievement tracking and milestones

### Gamification Elements

- **Experience Points (XP) System**
  - Earn XP for completed tasks and habits
  - Level progression based on accumulated XP
  - Bonus XP for streaks and achievements

- **Achievement System**
  - Unlock badges for reaching milestones
  - Special achievements for consistency and progress
  - Achievement showcase on user profile

- **Leaderboards**
  - Compete with other users based on XP and streaks
  - Weekly and all-time rankings
  - Friend competition features

- **Mini-Games**
  - Built-in games for additional engagement
  - Game rewards tie into the main XP system
  - "Breakthrough Game" for extra motivation

### Additional Features

- **Fitness Tracking**
  - Track fitness activities and workouts
  - Generate personalized fitness plans
  - Monitor fitness-related achievements

- **AI Assistant**
  - AI-powered suggestions for habits and tasks
  - Intelligent reminders and motivation
  - Natural language task creation

- **Progress Visualization**
  - Charts and graphs for performance tracking
  - Streak calendars and heat maps
  - XP progression visualization

### Application Flow

1. **Authentication Flow**
   - User registers/logs in through `/login` or `/register` pages
   - JWT token is generated and stored for authenticated requests
   - Protected routes check auth status via middleware

2. **Data Flow**
   - Frontend components use React context for state management
   - API requests to backend endpoints for data operations
   - MongoDB interaction through Mongoose models
   - Real-time updates through state management

## Technology Stack

### Frontend
- **React** - UI library for building component-based interfaces
- **Next.js** - React framework with server-side rendering and routing
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Component library based on Radix UI
- **Recharts** - Charting library for data visualization
- **date-fns** - Date utility library

### Backend
- **Next.js API Routes** - Serverless function endpoints
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **JSON Web Tokens (JWT)** - For secure authentication
- **bcrypt** - For password hashing

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code quality checking
- **npm** - Package management

### Deployment
- **Vercel** - Hosting platform for Next.js applications

## API Documentation

### Authentication Endpoints

- `POST /api/register` - Create new user account
- `POST /api/login` - Authenticate user and generate JWT
- `GET /api/user/profile` - Get user profile information

### Task Management Endpoints

- `GET /api/tasks` - Get all tasks for current user
  - Optional query param: `date` to filter by specific date
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks` - Update an existing task
- `DELETE /api/tasks` - Delete a task
- `GET /api/tasks/[id]` - Get specific task by ID
- `PUT /api/tasks/[id]` - Update specific task by ID
- `DELETE /api/tasks/[id]` - Delete specific task by ID

### User Progress Endpoints

- `GET /api/user/achievements` - Get user achievements
- `GET /api/stats/performance` - Get user performance stats
- `GET /api/users/leaderboard` - Get leaderboard rankings
- `POST /api/users/update-xp` - Update user XP after task completion

## Component Structure

### Core Components

#### Layout Components
- `main-layout.tsx` - Main application layout with navigation
- `shared-layout.tsx` - Shared layout structure for pages
- `space-background.tsx` - Animated background for the app

#### Task Components
- `task-list.tsx` - Renders list of tasks with interaction controls
- `task-form.tsx` - Form for creating/editing tasks
- `todays-tasks.tsx` - Component for displaying today's tasks
- `RecurringTaskManager.tsx` - Manages recurring tasks interface

#### UI Components
- UI components library (button, card, input, etc.)
- Themed components for consistent styling

#### Visualization Components
- `performance-chart.tsx` - Charts for visualizing progress
- `leaderboard.tsx` - Display user rankings

### Context Providers

- `auth-context.js` - Manages authentication state
- `task-context.tsx` - Provides task-related data and functions
- `HabitContext.js` - Manages habit-related state
- `EventContext.js` - Handles application events

## Authentication

Authentication is handled via JWT (JSON Web Tokens) with the following flow:

1. User submits credentials via login form
2. Server validates credentials and issues JWT
3. Token is stored in client (HTTP-only cookies)
4. Token is included in API requests for authentication
5. Middleware validates token on protected routes
6. Invalid/expired tokens redirect to login

Security features include:
- Password hashing with bcrypt
- HTTP-only cookies for token storage
- Token expiration and refresh mechanism
- Protected API routes with auth checks

## Database Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String, // Hashed
  xp: Number,
  level: Number,
  streak: Number,
  createdAt: Date,
  achievements: [{ type: ObjectId, ref: 'Achievement' }]
}
```

### Task Model
```javascript
{
  user: { type: ObjectId, ref: 'User' },
  title: String,
  description: String,
  dueDate: Date,
  completed: Boolean,
  completedAt: Date,
  xpReward: Number,
  isHabit: Boolean,
  isRecurring: Boolean,
  frequency: String, // daily, weekly, biweekly, monthly
  recurringEndDate: Date,
  parentTaskId: { type: ObjectId, ref: 'Task' }
}
```

### Achievement Model
```javascript
{
  title: String,
  description: String,
  criteria: Object,
  xpReward: Number,
  icon: String
}
```

### Other Models
- Badge Model - For collectible items
- GameScore Model - For tracking mini-game scores
- Habit Model - For dedicated habit tracking

## Gamification Elements

### XP System
The XP system is implemented in `/lib/xp-system.ts` with the following features:
- Task completion rewards (configurable XP per task)
- Streak bonuses (increasing multipliers)
- Achievement rewards
- Level thresholds (100 XP per level)

### Achievement System
Achievements are triggered by various user actions:
- Streak milestones (7 days, 14 days, 30 days)
- Task completion counts
- Special actions (early morning tasks, etc.)
- Level milestones

### Leaderboard System
The leaderboard system ranks users based on:
- Total XP earned
- Current streak length
- Tasks completed (weekly/monthly)

## Installation

Prerequisites:
- Node.js 18.x or later
- npm 8.x or later
- MongoDB database

Steps:

1. Clone the repository:
```bash
git clone https://github.com/Ronitsabhaya75/habit.git
cd habit
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following environment variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
API_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

## Development

### Code Style and Standards
- TypeScript for type safety
- ESLint for code quality
- Component-based architecture
- Context API for state management

### Adding New Features
1. Create new components in `/components`
2. Add page routes in `/app` directory
3. Implement API endpoints in `/app/api`
4. Update relevant context providers

### Testing
- Unit tests can be added using Jest
- API testing with tools like Postman or Insomnia

### Review System

The review system allows users to submit feedback about their experience with HabitQuest. 

#### Production Setup

In production environments, reviews are currently logged but not stored persistently. This is a temporary solution to address file system limitations in production hosting.

#### Development Setup

In development, reviews can be saved to the local file system in the `data/reviews.json` file.

#### Future Improvements

A future update will implement proper database storage for reviews using a database service.

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy from main branch

Configuration for deployment is in `vercel.json` and includes:
- Build commands
- Output directory
- Environment configuration
- Framework preset (Next.js)

## Future Enhancements

Planned features for future releases:

1. **Social Features**
   - Friend system
   - Social challenges
   - Group habits and accountability

2. **Advanced Analytics**
   - More detailed progress tracking
   - Habit correlation analysis
   - Performance insights

3. **Mobile App**
   - Native mobile application
   - Push notifications
   - Offline functionality

4. **Integration Features**
   - Calendar integration (Google Calendar, etc.)
   - Health app integration
   - Smart device connectivity

## Troubleshooting

### Review Submission Errors

If you encounter "Failed to save review to local storage" errors in production:
- This is expected behavior since the production environment has a read-only file system
- The API is configured to acknowledge the review submission without persisting it to disk
- Check server logs for the review data which is being logged

## License

MIT
