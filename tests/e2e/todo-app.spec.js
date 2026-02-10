const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO App E2E Tests', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    // Setup: Initialize page object and navigate
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.waitForLoading();
    
    // Clear any existing tasks for clean state
    const taskCount = await todoPage.getTaskCount();
    if (taskCount > 0) {
      await todoPage.clearAllTasks();
    }
  });

  test('should display empty state when no tasks exist', async () => {
    // Verify empty state message is visible
    const isEmptyVisible = await todoPage.isEmptyStateVisible();
    expect(isEmptyVisible).toBe(true);
    
    const message = await todoPage.getEmptyStateMessage();
    expect(message).toContain('No tasks yet');
  });

  test('should add a new task', async () => {
    // Act: Add a new task
    await todoPage.addTask('Buy groceries');

    // Assert: Task should appear in the list
    const taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(1);
    
    const task = todoPage.getTaskByText('Buy groceries');
    await expect(task).toBeVisible();
    
    // Verify the task is not completed by default
    const isCompleted = await todoPage.isTaskCompleted('Buy groceries');
    expect(isCompleted).toBe(false);
  });

  test('should mark task as complete', async () => {
    // Arrange: Add a task
    await todoPage.addTask('Complete assignment');

    // Act: Mark the task as complete
    await todoPage.toggleTask('Complete assignment');

    // Assert: Task should be marked as completed
    const isCompleted = await todoPage.isTaskCompleted('Complete assignment');
    expect(isCompleted).toBe(true);
    
    // Verify strikethrough styling is applied
    const hasStrikethrough = await todoPage.hasStrikethrough('Complete assignment');
    expect(hasStrikethrough).toBe(true);
  });

  test('should toggle task between complete and incomplete', async () => {
    // Arrange: Add and complete a task
    await todoPage.addTask('Task to toggle');
    await todoPage.toggleTask('Task to toggle');
    
    let isCompleted = await todoPage.isTaskCompleted('Task to toggle');
    expect(isCompleted).toBe(true);

    // Act: Toggle back to incomplete
    await todoPage.toggleTask('Task to toggle');

    // Assert: Task should be incomplete
    isCompleted = await todoPage.isTaskCompleted('Task to toggle');
    expect(isCompleted).toBe(false);
    
    // Verify strikethrough is removed
    const hasStrikethrough = await todoPage.hasStrikethrough('Task to toggle');
    expect(hasStrikethrough).toBe(false);
  });

  test('should delete a task', async () => {
    // Arrange: Add a task
    await todoPage.addTask('Task to delete');
    let taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(1);

    // Act: Delete the task
    await todoPage.deleteTask('Task to delete');

    // Assert: Task should be removed
    taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(0);
    
    // Empty state should be visible again
    const isEmptyVisible = await todoPage.isEmptyStateVisible();
    expect(isEmptyVisible).toBe(true);
  });

  test('should handle multiple tasks workflow', async () => {
    // Add multiple tasks
    await todoPage.addTask('Task 1');
    await todoPage.addTask('Task 2');
    await todoPage.addTask('Task 3');

    // Verify all tasks are added
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
    
    // Verify remaining tasks
    const task = todoPage.getTaskByText('Task 1');
    await expect(task).not.toBeVisible();
    
    const task2 = todoPage.getTaskByText('Task 2');
    await expect(task2).toBeVisible();
    
    const task3 = todoPage.getTaskByText('Task 3');
    await expect(task3).toBeVisible();
  });

  test('should persist tasks after page reload', async () => {
    // Arrange: Add tasks
    await todoPage.addTask('Persistent task 1');
    await todoPage.addTask('Persistent task 2');
    await todoPage.toggleTask('Persistent task 2');

    // Act: Reload the page
    await todoPage.goto();
    await todoPage.waitForLoading();

    // Assert: Tasks should still be there
    const taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(2);
    
    await expect(todoPage.getTaskByText('Persistent task 1')).toBeVisible();
    await expect(todoPage.getTaskByText('Persistent task 2')).toBeVisible();
    
    // Verify completion status is preserved
    const isCompleted = await todoPage.isTaskCompleted('Persistent task 2');
    expect(isCompleted).toBe(true);
  });

  test('should prevent adding empty task', async ({ page }) => {
    // Arrange: Focus on input but don't type anything
    await todoPage.addButton.click();

    // Assert: No task should be added
    const taskCount = await todoPage.getTaskCount();
    expect(taskCount).toBe(0);
    
    // Empty state should still be visible
    const isEmptyVisible = await todoPage.isEmptyStateVisible();
    expect(isEmptyVisible).toBe(true);
  });

  test('should clear input field after adding task', async () => {
    // Act: Add a task
    await todoPage.taskInput.fill('Test task');
    await todoPage.addButton.click();
    
    // Wait for task to be added
    await todoPage.page.waitForTimeout(500);

    // Assert: Input should be cleared
    const inputValue = await todoPage.taskInput.inputValue();
    expect(inputValue).toBe('');
  });
});