# Testing Guidelines

This document outlines the testing principles, strategies, and best practices for the TODO application.

## Testing Philosophy

- **Test-Driven Development (TDD)**: Write tests before or alongside implementation
- **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
- **Test Coverage**: Aim for meaningful coverage, not just high percentages
- **Test Quality**: Tests should be maintainable, readable, and reliable
- **Isolation**: Each test must be independent and not rely on other tests

## Test Types and Strategy

### 1. Unit Tests

**Purpose**: Test individual functions and React components in isolation.

**Framework**: Jest with React Testing Library for frontend components

**Naming Convention**: `*.test.js` or `*.test.ts`

**Directory Structure**:
- **Backend**: `packages/backend/src/__tests__/`
  - Co-located with source code for easy discovery
  - Example: `packages/backend/src/__tests__/app.test.js`
  
- **Frontend**: `packages/frontend/src/__tests__/`
  - Co-located with source code
  - Example: `packages/frontend/src/__tests__/App.test.js`

**What to Test**:
- Pure functions and utility methods
- React component rendering and behavior
- State management logic
- Event handlers
- Conditional rendering
- Props handling
- Error boundaries

**Best Practices**:
- Test behavior, not implementation details
- Use descriptive test names that explain the scenario
- Follow Arrange-Act-Assert (AAA) pattern
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests focused on a single behavior

**Example Unit Test Structure**:
```javascript
describe('TodoList Component', () => {
  it('should render an empty list when no todos are provided', () => {
    // Arrange
    const { container } = render(<TodoList todos={[]} />);
    
    // Assert
    expect(container.querySelector('.todo-item')).toBeNull();
  });

  it('should render all provided todos', () => {
    // Arrange
    const todos = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true }
    ];
    
    // Act
    const { getAllByRole } = render(<TodoList todos={todos} />);
    
    // Assert
    expect(getAllByRole('listitem')).toHaveLength(2);
  });
});
```

### 2. Integration Tests

**Purpose**: Test backend API endpoints with real HTTP requests and verify component integration.

**Framework**: Jest + Supertest for backend API testing

**Naming Convention**: `*.test.js` or `*.test.ts`

**Directory Structure**:
- **Backend API Tests**: `packages/backend/src/__tests__/integration/`
  - Co-located with source code under integration subdirectory
  - Example: `packages/backend/src/__tests__/integration/api.test.js`

**What to Test**:
- API endpoint responses (status codes, response bodies)
- Request validation and error handling
- CRUD operations on resources
- Database interactions (with test database)
- Middleware functionality
- Authentication/authorization flows (if applicable)

**Best Practices**:
- Use a separate test database or in-memory database
- Clean up test data after each test
- Test complete request/response cycles
- Verify HTTP status codes and response formats
- Test error scenarios and edge cases
- Use setup/teardown hooks for database state

**Example Integration Test Structure**:
```javascript
const request = require('supertest');
const app = require('../../app');

describe('TODO API Integration Tests', () => {
  beforeEach(async () => {
    // Setup: Clear database and seed test data
    await clearDatabase();
  });

  afterEach(async () => {
    // Teardown: Clean up test data
    await clearDatabase();
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      // Arrange
      await seedTodos([
        { title: 'Task 1', completed: false },
        { title: 'Task 2', completed: true }
      ]);

      // Act
      const response = await request(app)
        .get('/api/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title', 'Task 1');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      // Arrange
      const newTodo = { title: 'New Task', completed: false };

      // Act
      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect('Content-Type', /json/)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Task');
      expect(response.body.completed).toBe(false);
    });

    it('should return 400 for invalid todo data', async () => {
      // Act & Assert
      await request(app)
        .post('/api/todos')
        .send({ title: '' })
        .expect(400);
    });
  });
});
```

### 3. End-to-End (E2E) Tests

**Purpose**: Test complete user workflows through browser automation to verify the entire application works as expected.

**Framework**: Playwright (required)

**Naming Convention**: `*.spec.js` or `*.spec.ts`

**Directory Structure**:
- **E2E Tests**: `tests/e2e/`
  - Separate from source code at repository root level
  - Example: `tests/e2e/todo-app.spec.js`
  - Page objects: `tests/e2e/pages/` (for Page Object Model)
  - Example: `tests/e2e/pages/TodoPage.js`

**Browser Configuration**:
- **Use one browser only** (e.g., Chromium) for faster test execution
- Configure in `playwright.config.js`

**What to Test**:
- Critical user journeys (5-8 key workflows)
- Focus on happy paths and essential edge cases
- Complete workflows from user perspective
- UI interactions and visual feedback
- End-to-end data flow (frontend ↔ backend ↔ database)

**Critical User Journeys to Test**:
1. Add a new task
2. Mark task as complete/incomplete
3. Delete a task
4. View all tasks
5. Handle empty state (no tasks)
6. Handle error scenarios (API failures)
7. Page load with existing tasks
8. Multiple task operations in sequence

**Page Object Model (POM) Pattern**:
- **Required** for all Playwright tests
- Encapsulates page structure and interactions
- Improves maintainability and reduces duplication
- Separates test logic from page structure

**Best Practices**:
- Limit E2E tests to critical paths only
- Use Page Object Model for all page interactions
- Tests must be isolated and independent
- Each test should set up its own data
- Use setup and teardown hooks
- Tests must succeed on multiple runs (idempotent)
- Use meaningful selectors (data-testid preferred)
- Wait for elements properly (no arbitrary waits)
- Take screenshots on failures for debugging
- Keep tests focused on user behavior, not implementation

**Example E2E Test with Page Object Model**:

**Page Object** (`tests/e2e/pages/TodoPage.js`):
```javascript
class TodoPage {
  constructor(page) {
    this.page = page;
    this.taskInput = page.locator('[data-testid="task-input"]');
    this.addButton = page.locator('[data-testid="add-task-button"]');
    this.taskList = page.locator('[data-testid="task-list"]');
    this.taskItems = page.locator('[data-testid="task-item"]');
  }

  async goto() {
    await this.page.goto('http://localhost:3000');
  }

  async addTask(title) {
    await this.taskInput.fill(title);
    await this.addButton.click();
  }

  async getTaskCount() {
    return await this.taskItems.count();
  }

  async getTaskByText(text) {
    return this.taskItems.filter({ hasText: text });
  }

  async toggleTask(taskText) {
    const task = await this.getTaskByText(taskText);
    await task.locator('[data-testid="task-checkbox"]').click();
  }

  async deleteTask(taskText) {
    const task = await this.getTaskByText(taskText);
    await task.locator('[data-testid="delete-button"]').click();
  }

  async isTaskCompleted(taskText) {
    const task = await this.getTaskByText(taskText);
    const checkbox = task.locator('[data-testid="task-checkbox"]');
    return await checkbox.isChecked();
  }
}

module.exports = { TodoPage };
```

**Test File** (`tests/e2e/todo-app.spec.js`):
```javascript
const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO App E2E Tests', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    // Setup: Initialize page object and navigate
    todoPage = new TodoPage(page);
    await todoPage.goto();
    
    // Clear any existing data if needed
    await clearTestData();
  });

  test.afterEach(async () => {
    // Teardown: Clean up test data
    await clearTestData();
  });

  test('should add a new task', async () => {
    // Act
    await todoPage.addTask('Buy groceries');

    // Assert
    const taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(1);
    
    const task = await todoPage.getTaskByText('Buy groceries');
    await expect(task).toBeVisible();
  });

  test('should mark task as complete', async () => {
    // Arrange
    await todoPage.addTask('Complete assignment');

    // Act
    await todoPage.toggleTask('Complete assignment');

    // Assert
    const isCompleted = await todoPage.isTaskCompleted('Complete assignment');
    expect(isCompleted).toBe(true);
  });

  test('should delete a task', async () => {
    // Arrange
    await todoPage.addTask('Task to delete');
    let taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(1);

    // Act
    await todoPage.deleteTask('Task to delete');

    // Assert
    taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(0);
  });

  test('should handle multiple tasks workflow', async () => {
    // Add multiple tasks
    await todoPage.addTask('Task 1');
    await todoPage.addTask('Task 2');
    await todoPage.addTask('Task 3');

    // Verify all tasks added
    let taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(3);

    // Complete one task
    await todoPage.toggleTask('Task 2');
    const isCompleted = await todoPage.isTaskCompleted('Task 2');
    expect(isCompleted).toBe(true);

    // Delete one task
    await todoPage.deleteTask('Task 1');
    taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(2);
  });
});
```

## Test Coverage Requirements

### Coverage Targets
- **Unit Tests**: Aim for 80%+ code coverage
- **Integration Tests**: Cover all API endpoints
- **E2E Tests**: Cover 5-8 critical user journeys

### What Requires Tests
- **All new features** must include appropriate tests
- Bug fixes should include regression tests
- API changes must update integration tests
- UI changes affecting user workflows must update E2E tests

### Coverage Reports
- Run `npm test -- --coverage` to generate coverage reports
- Review coverage reports in CI/CD pipeline
- Focus on meaningful coverage, not just percentages

## Test Isolation and Independence

### Critical Rules
1. **No test dependencies**: Tests must not rely on execution order
2. **Independent data**: Each test creates its own test data
3. **Clean state**: Use beforeEach/afterEach hooks to ensure clean state
4. **Idempotent**: Tests must succeed on multiple runs
5. **Parallel safe**: Tests should be able to run in parallel (when possible)

### Setup and Teardown

**Required Hooks**:
```javascript
beforeEach(async () => {
  // Setup: Create clean state before each test
  await setupTestDatabase();
  await seedRequiredData();
});

afterEach(async () => {
  // Teardown: Clean up after each test
  await clearTestData();
  await resetMocks();
});

afterAll(async () => {
  // Final cleanup: Close connections, etc.
  await closeDatabase();
});
```

## Mocking and Test Doubles

### When to Mock
- External API calls
- Database connections (in unit tests)
- Browser APIs (localStorage, fetch, etc.)
- Time-dependent functionality (Date.now(), timers)
- Third-party services

### Mocking Libraries
- **Jest mocks**: Built-in mocking for modules and functions
- **MSW (Mock Service Worker)**: For mocking HTTP requests in frontend tests
- **Supertest**: For integration testing without mocking

### Example Mocking
```javascript
// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ todos: [] }),
  })
);

// Mock module
jest.mock('../api/todoService', () => ({
  getTodos: jest.fn(() => Promise.resolve([])),
  addTodo: jest.fn((todo) => Promise.resolve({ id: 1, ...todo })),
}));
```

## Test Naming Conventions

### Unit and Integration Tests
```javascript
describe('ComponentName or FeatureName', () => {
  describe('when in specific context', () => {
    it('should do something specific', () => {
      // test implementation
    });
  });
});
```

### E2E Tests
```javascript
test.describe('Feature Name', () => {
  test('should complete user workflow successfully', async () => {
    // test implementation
  });
});
```

### Naming Guidelines
- Use descriptive names that explain the scenario
- Start with "should" for expected behavior
- Include context in nested describe blocks
- Avoid implementation details in names
- Focus on business logic and user outcomes

## Running Tests

### Commands
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- packages/frontend/src/__tests__/App.test.js

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode (visible browser)
npm run test:e2e -- --headed

# Run E2E tests in debug mode
npm run test:e2e -- --debug
```

### CI/CD Integration
- All tests must pass before merging PRs
- Run unit and integration tests on every commit
- Run E2E tests on every PR and before deployment
- Generate and publish coverage reports

## Debugging Tests

### Unit and Integration Tests
- Use `test.only()` to run a single test
- Use `console.log()` for debugging (remove before commit)
- Use Jest debugger with `node --inspect-brk`
- Check test output and error messages

### E2E Tests
- Run in headed mode: `--headed`
- Use Playwright Inspector: `--debug`
- Take screenshots: `await page.screenshot({ path: 'debug.png' })`
- Use `page.pause()` to pause execution
- Check Playwright trace viewer for detailed logs

## Best Practices Summary

### General
- ✅ Write tests that are easy to read and understand
- ✅ Test behavior, not implementation
- ✅ Keep tests focused and concise
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Ensure tests are isolated and independent
- ✅ Use setup/teardown hooks for clean state
- ❌ Don't test framework code or libraries
- ❌ Don't write tests that depend on execution order
- ❌ Don't use arbitrary waits (use proper wait strategies)

### Unit Tests
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ✅ Test component rendering and user interactions
- ✅ Use React Testing Library queries (getByRole, getByText)
- ❌ Don't test implementation details
- ❌ Don't access component state directly

### Integration Tests
- ✅ Use real HTTP requests with Supertest
- ✅ Test complete request/response cycles
- ✅ Verify status codes and response formats
- ✅ Clean up database after each test
- ❌ Don't share test data between tests

### E2E Tests
- ✅ Use Page Object Model (required)
- ✅ Limit to 5-8 critical user journeys
- ✅ Use meaningful selectors (data-testid)
- ✅ Wait for elements properly
- ✅ Test from user perspective
- ❌ Don't test every possible scenario
- ❌ Don't rely on timing/sleep
- ❌ Don't duplicate unit/integration test coverage

## Accessibility Testing

### Tools
- **jest-axe**: Automated accessibility testing in unit tests
- **Playwright accessibility APIs**: Check ARIA roles and labels in E2E tests

### What to Test
- Proper ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader compatibility
- Color contrast (manual verification)

## Performance Testing

### Considerations
- Monitor test execution time
- Optimize slow tests (especially E2E)
- Run E2E tests in parallel when possible (separate test data)
- Use test.describe.configure({ mode: 'parallel' }) for Playwright

## Continuous Improvement

- Review and refactor tests regularly
- Remove flaky tests or fix root causes
- Update tests when requirements change
- Share testing knowledge with the team
- Learn from test failures
