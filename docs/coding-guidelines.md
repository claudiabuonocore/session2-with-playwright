# Coding Guidelines

This document outlines the coding style, quality principles, and best practices for the TODO application.

## Philosophy

Write code that is:
- **Readable**: Clear and easy to understand at first glance
- **Maintainable**: Easy to modify and extend over time
- **Consistent**: Follows established patterns throughout the codebase
- **Tested**: Accompanied by appropriate tests that verify behavior
- **Simple**: Solves the problem without unnecessary complexity

## Code Quality Principles

### DRY (Don't Repeat Yourself)
Extract repeated logic into reusable functions, components, or utilities. If you find yourself copying code, create an abstraction instead.

**Bad**:
```javascript
// Repeated validation logic
if (!taskTitle || taskTitle.trim() === '') {
  return res.status(400).json({ error: 'Title required' });
}

// Same validation elsewhere
if (!taskTitle || taskTitle.trim() === '') {
  throw new Error('Title required');
}
```

**Good**:
```javascript
// Shared utility function
function validateTaskTitle(title) {
  if (!title || title.trim() === '') {
    throw new Error('Title required');
  }
  return title.trim();
}
```

### KISS (Keep It Simple, Stupid)
Favor simple, straightforward solutions over clever or complex ones. Code should be as simple as possible, but no simpler.

### YAGNI (You Aren't Gonna Need It)
Don't add functionality until it's actually needed. Avoid over-engineering and premature optimization.

### Single Responsibility Principle
Each function, component, and module should have one clear responsibility. If a function does multiple unrelated things, split it up.

### Separation of Concerns
Keep different aspects of the application separate:
- UI logic separate from business logic
- API calls separate from component rendering
- Data transformation separate from data display

## General Formatting Rules

### Indentation and Spacing
- **Use 2 spaces** for indentation (no tabs)
- **Line length**: Aim for 80-100 characters maximum
- **Blank lines**: Use to separate logical blocks of code
- **Trailing whitespace**: Remove all trailing whitespace

### Semicolons
- **JavaScript**: Use semicolons consistently (recommended)
- Follow the project's existing convention
- Configure ESLint to enforce consistency

### Quotes
- **Use single quotes** for strings in JavaScript: `'hello'`
- **Use double quotes** for JSX attributes: `<div className="container">`
- Use template literals for string interpolation: `` `Hello ${name}` ``

### Braces
Always use braces for control statements, even single-line blocks:

**Bad**:
```javascript
if (condition) doSomething();
```

**Good**:
```javascript
if (condition) {
  doSomething();
}
```

### Naming Conventions

#### JavaScript/TypeScript
- **Variables and functions**: camelCase - `getUserData`, `taskList`
- **Constants**: UPPER_SNAKE_CASE - `MAX_TASKS`, `API_BASE_URL`
- **Classes and Components**: PascalCase - `TodoList`, `TaskItem`
- **Private properties**: Prefix with underscore - `_internalState`
- **Boolean variables**: Prefix with is/has/can - `isComplete`, `hasError`, `canEdit`

#### Files and Directories
- **Components**: PascalCase - `TodoList.js`, `TaskItem.js`
- **Utilities**: camelCase - `apiClient.js`, `validators.js`
- **Tests**: Match source file with `.test` or `.spec` - `TodoList.test.js`
- **Constants**: camelCase - `constants.js`, `config.js`

#### Descriptive Names
Use clear, descriptive names that reveal intent:

**Bad**:
```javascript
const d = new Date();
const t = tasks.filter(x => x.c);
```

**Good**:
```javascript
const currentDate = new Date();
const completedTasks = tasks.filter(task => task.completed);
```

## Import Organization

Organize imports in the following order, with blank lines between groups:

1. **External/Third-party imports** (React, libraries)
2. **Internal absolute imports** (from `src/`)
3. **Relative imports** (from current directory)
4. **CSS/Style imports**

**Example**:
```javascript
// External imports
import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';

// Internal absolute imports
import { validateTask } from 'utils/validators';
import { API_BASE_URL } from 'constants/config';

// Relative imports
import TodoList from './TodoList';
import TaskItem from './TaskItem';

// Styles
import './App.css';
```

### Import Sorting
- Sort alphabetically within each group
- Use named imports when possible for better tree-shaking
- Avoid `import *` unless necessary

**Good**:
```javascript
import { useState, useEffect } from 'react';
```

**Avoid**:
```javascript
import * as React from 'react';
```

## Linter Configuration and Usage

### ESLint
Use ESLint to enforce code quality and consistency.

**Configuration** (`.eslintrc.json` or `.eslintrc.js`):
```json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "no-unused-vars": ["warn"],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
  }
}
```

### Prettier
Use Prettier for consistent code formatting.

**Configuration** (`.prettierrc`):
```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### Running Linters
```bash
# Lint all files
npm run lint

# Lint and auto-fix
npm run lint -- --fix

# Format with Prettier
npm run format
```

### Pre-commit Hooks
Use Husky and lint-staged to run linters before commits:
- Automatically format code with Prettier
- Run ESLint checks
- Prevent commits with linting errors

## JavaScript Best Practices

### Variable Declaration
- **Prefer `const`** by default
- **Use `let`** only when reassignment is needed
- **Never use `var`**

```javascript
const maxTasks = 100;        // Won't change
let currentCount = 0;        // Will change
```

### Function Declaration

**Prefer arrow functions** for consistency and lexical `this`:
```javascript
const addTask = (task) => {
  // implementation
};
```

**Use function declarations** for top-level functions or when hoisting is needed:
```javascript
function initializeApp() {
  // implementation
}
```

### Async/Await vs Promises
Prefer async/await over promise chains for better readability:

**Good**:
```javascript
async function fetchTasks() {
  try {
    const response = await axios.get('/api/todos');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }
}
```

**Avoid**:
```javascript
function fetchTasks() {
  return axios.get('/api/todos')
    .then(response => response.data)
    .catch(error => {
      console.error('Failed to fetch tasks:', error);
      throw error;
    });
}
```

### Error Handling
Always handle errors appropriately:
- Use try-catch blocks with async/await
- Provide meaningful error messages
- Log errors for debugging
- Show user-friendly messages to users

```javascript
async function handleAddTask(task) {
  try {
    const newTask = await addTask(task);
    setTasks([...tasks, newTask]);
    showSuccessMessage('Task added successfully');
  } catch (error) {
    console.error('Error adding task:', error);
    showErrorMessage('Failed to add task. Please try again.');
  }
}
```

### Array and Object Manipulation
Use modern JavaScript methods and spread operators:

```javascript
// Array operations
const activeTasks = tasks.filter(task => !task.completed);
const taskTitles = tasks.map(task => task.title);
const allCompleted = tasks.every(task => task.completed);

// Spread operators
const newTasks = [...tasks, newTask];
const updatedTask = { ...task, completed: true };

// Destructuring
const { id, title, completed } = task;
const [first, second, ...rest] = tasks;
```

### Avoid Mutation
Prefer immutable operations over mutating data:

**Bad**:
```javascript
task.completed = true;
tasks.push(newTask);
```

**Good**:
```javascript
const updatedTask = { ...task, completed: true };
const updatedTasks = [...tasks, newTask];
```

## React Best Practices

### Component Structure
Organize components in this order:
1. Imports
2. Component definition
3. PropTypes/TypeScript types
4. Default props
5. Export

```javascript
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './TodoItem.css';

function TodoItem({ task, onToggle, onDelete }) {
  // Component logic
  return (
    // JSX
  );
}

TodoItem.propTypes = {
  task: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoItem;
```

### Hooks Usage
- **Call hooks at the top level** (never inside loops, conditions, or nested functions)
- **Name custom hooks** with `use` prefix: `useTaskManager`, `useFetch`
- **Extract complex logic** into custom hooks
- **Order hooks consistently**: useState, useEffect, custom hooks, callbacks

```javascript
function TodoApp() {
  // State hooks first
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Effect hooks
  useEffect(() => {
    fetchTasks();
  }, []);
  
  // Custom hooks
  const { showMessage } = useNotification();
  
  // Callbacks and handlers
  const handleAddTask = useCallback((task) => {
    // implementation
  }, [tasks]);
  
  return (/* JSX */);
}
```

### Props and State
- **Keep state as local as possible** - don't lift state unnecessarily
- **Derive data from state** instead of duplicating it
- **Use prop destructuring** for cleaner code
- **Provide default props** when appropriate

```javascript
function TaskList({ tasks = [], onTaskUpdate }) {
  // Derived state
  const completedCount = tasks.filter(t => t.completed).length;
  
  return (/* JSX */);
}
```

### Conditional Rendering
Use concise patterns for conditional rendering:

```javascript
// Ternary for if-else
{isLoading ? <Spinner /> : <TaskList tasks={tasks} />}

// Logical AND for if-only
{error && <ErrorMessage message={error} />}

// Early return for complex conditions
if (!tasks.length) {
  return <EmptyState />;
}
```

### Event Handlers
- **Prefix with `handle`**: `handleClick`, `handleSubmit`
- **Pass functions, not function calls**: `onClick={handleClick}`, not `onClick={handleClick()}`
- **Use arrow functions** to pass parameters: `onClick={() => handleDelete(id)}`

### Keys in Lists
Always provide stable, unique keys when rendering lists:

**Good**:
```javascript
{tasks.map(task => (
  <TaskItem key={task.id} task={task} />
))}
```

**Bad**:
```javascript
{tasks.map((task, index) => (
  <TaskItem key={index} task={task} />
))}
```

## Backend Best Practices (Node.js/Express)

### Route Organization
- Keep routes simple and focused
- Extract business logic into service functions
- Use middleware for cross-cutting concerns
- Organize routes by resource

```javascript
// routes/todos.js
const express = require('express');
const router = express.Router();
const todoService = require('../services/todoService');

router.get('/', async (req, res) => {
  try {
    const todos = await todoService.getAllTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

module.exports = router;
```

### Error Handling
Use centralized error handling middleware:

```javascript
// errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
```

### Input Validation
Always validate and sanitize user input:

```javascript
function validateTodoInput(req, res, next) {
  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ error: 'Title too long' });
  }
  
  req.body.title = title.trim();
  next();
}
```

### Async Route Handlers
Use async/await with proper error handling:

```javascript
async function getTodos(req, res, next) {
  try {
    const todos = await todoService.getAllTodos();
    res.json(todos);
  } catch (error) {
    next(error); // Pass to error handler
  }
}
```

## Comments and Documentation

### When to Comment
- **Complex logic**: Explain the "why", not the "what"
- **Non-obvious solutions**: Clarify workarounds or special cases
- **Public APIs**: Document function parameters, return values, behavior

### When NOT to Comment
- **Obvious code**: Don't state the obvious
- **Commented-out code**: Delete it (use version control)
- **Outdated comments**: Update or remove them

**Bad**:
```javascript
// Set the title to the task title
const title = task.title;
```

**Good**:
```javascript
// Using setTimeout to debounce API calls and reduce server load
const debouncedSave = debounce(saveTask, 500);
```

### JSDoc for Functions
Document public functions with JSDoc:

```javascript
/**
 * Fetches all tasks from the API
 * @returns {Promise<Array>} Array of task objects
 * @throws {Error} If the API request fails
 */
async function fetchTasks() {
  // implementation
}
```

## Git Commit Guidelines

### Commit Message Format
```
<type>: <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no code change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependencies

### Examples
```
feat: Add task completion toggle functionality

Implement checkbox to mark tasks as complete/incomplete.
Updates task state and syncs with backend API.

fix: Prevent duplicate task submissions

Add loading state to disable submit button while request is pending.
Fixes issue where rapid clicks created duplicate tasks.

docs: Update testing guidelines with Playwright examples
```

### Commit Best Practices
- **Commit often**: Small, focused commits
- **Write clear messages**: Explain what and why
- **One concern per commit**: Don't mix unrelated changes
- **Test before committing**: Ensure tests pass

## Code Review Guidelines

### What to Look For
- **Correctness**: Does the code work as intended?
- **Tests**: Are appropriate tests included?
- **Readability**: Is the code easy to understand?
- **Best practices**: Does it follow project conventions?
- **Performance**: Are there obvious performance issues?
- **Security**: Are there potential security vulnerabilities?

### Giving Feedback
- Be constructive and specific
- Explain the reasoning behind suggestions
- Distinguish between required changes and suggestions
- Acknowledge good solutions

### Receiving Feedback
- Be open to suggestions
- Ask questions if feedback is unclear
- Don't take criticism personally
- Thank reviewers for their time

## Performance Considerations

### Frontend
- **Avoid unnecessary re-renders**: Use React.memo, useMemo, useCallback
- **Lazy load components**: Use React.lazy for code splitting
- **Optimize images**: Compress and use appropriate formats
- **Debounce expensive operations**: API calls, complex calculations

### Backend
- **Minimize database queries**: Use efficient queries and indexes
- **Cache when appropriate**: Cache frequently accessed data
- **Use async operations**: Don't block the event loop
- **Handle errors gracefully**: Prevent cascading failures

## Security Best Practices

### Input Validation
- Validate all user input on both client and server
- Sanitize input to prevent XSS attacks
- Use parameterized queries to prevent SQL injection

### API Security
- Use HTTPS in production
- Implement rate limiting
- Validate content types
- Handle CORS appropriately

### Dependencies
- Keep dependencies up to date
- Review security advisories regularly
- Use `npm audit` to check for vulnerabilities
- Minimize dependency count

## Accessibility

### Semantic HTML
Use appropriate HTML elements:
```javascript
<button onClick={handleClick}>Add Task</button>  // Good
<div onClick={handleClick}>Add Task</div>        // Bad
```

### ARIA Labels
Provide labels for interactive elements:
```javascript
<IconButton aria-label="Delete task" onClick={handleDelete}>
  <DeleteIcon />
</IconButton>
```

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Maintain logical tab order
- Provide visible focus indicators

## File Organization

```
packages/
├── backend/
│   ├── src/
│   │   ├── __tests__/           # Unit and integration tests
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Express middleware
│   │   ├── utils/               # Utility functions
│   │   ├── app.js               # Express app setup
│   │   └── index.js             # Server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── __tests__/           # Unit tests
    │   ├── components/          # Reusable components
    │   ├── pages/               # Page components (if applicable)
    │   ├── utils/               # Utility functions
    │   ├── hooks/               # Custom hooks
    │   ├── services/            # API clients
    │   ├── styles/              # Global styles
    │   ├── App.js               # Main app component
    │   └── index.js             # Entry point
    └── package.json
```

## Continuous Improvement

- **Refactor regularly**: Improve code quality incrementally
- **Learn from mistakes**: Update guidelines based on issues encountered
- **Stay updated**: Keep up with language and framework updates
- **Share knowledge**: Document patterns and solutions
- **Review frequently**: Regularly review and update these guidelines
