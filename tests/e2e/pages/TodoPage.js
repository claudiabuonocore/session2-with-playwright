/**
 * Page Object Model for the TODO application
 * Encapsulates page interactions and selectors
 */
class TodoPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    
    // Selectors
    this.taskInput = page.locator('[data-testid="task-input"] input');
    this.addButton = page.locator('[data-testid="add-task-button"]');
    this.taskList = page.locator('[data-testid="task-list"]');
    this.taskItems = page.locator('[data-testid="task-item"]');
  }

  /**
   * Navigate to the TODO app
   */
  async goto() {
    await this.page.goto('/');
    // Wait for the app to load
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a new task
   * @param {string} title - The title of the task to add
   */
  async addTask(title) {
    await this.taskInput.fill(title);
    await this.addButton.click();
    // Wait for the task to appear in the list
    await this.page.waitForTimeout(500);
  }

  /**
   * Get the number of tasks in the list
   * @returns {Promise<number>}
   */
  async getTaskCount() {
    return await this.taskItems.count();
  }

  /**
   * Get a task element by its text
   * @param {string} text - The text of the task
   * @returns {import('@playwright/test').Locator}
   */
  getTaskByText(text) {
    return this.taskItems.filter({ hasText: text });
  }

  /**
   * Toggle the completion status of a task
   * @param {string} taskText - The text of the task to toggle
   */
  async toggleTask(taskText) {
    const task = this.getTaskByText(taskText);
    const checkbox = task.locator('[data-testid="task-checkbox"]');
    await checkbox.click();
    // Wait for the update to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete a task  
   * @param {string} taskText - The text of the task to delete
   */
  async deleteTask(taskText) {
    const task = this.getTaskByText(taskText);
    const deleteButton = task.locator('[data-testid="delete-button"]');
    await deleteButton.click();
    // Wait for the delete to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if a task is completed (checkbox is checked)
   * @param {string} taskText - The text of the task
   * @returns {Promise<boolean>}
   */
  async isTaskCompleted(taskText) {
    const task = this.getTaskByText(taskText);
    const checkbox = task.locator('[data-testid="task-checkbox"] input');
    return await checkbox.isChecked();
  }

  /**
   * Check if a task has strikethrough styling (completed)
   * @param {string} taskText - The text of the task
   * @returns {Promise<boolean>}
   */
  async hasStrikethrough(taskText) {
    const task = this.getTaskByText(taskText);
    const textElement = task.locator('[data-testid="task-text"]');
    const textDecoration = await textElement.evaluate(el => 
      window.getComputedStyle(el).textDecoration
    );
    return textDecoration.includes('line-through');
  }

  /**
   * Get the text of the empty state message
   * @returns {Promise<string>}
   */
  async getEmptyStateMessage() {
    const emptyState = this.page.locator('text=No tasks yet');
    return await emptyState.textContent();
  }

  /**
   * Check if the empty state is visible
   * @returns {Promise<boolean>}
   */
  async isEmptyStateVisible() {
    const emptyState = this.page.locator('text=No tasks yet');
    return await emptyState.isVisible();
  }

  /**
   * Check if an error alert is visible
   * @returns {Promise<boolean>}
   */
  async isErrorVisible() {
    const errorAlert = this.page.locator('[role="alert"]');
    return await errorAlert.isVisible();
  }

  /**
   * Get the error message text
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    const errorAlert = this.page.locator('[role="alert"]');
    return await errorAlert.textContent();
  }

  /**
   * Wait for the loading spinner to disappear
   */
  async waitForLoading() {
    await this.page.waitForSelector('[role="progressbar"]', { state: 'detached', timeout: 5000 });
  }

  /**
   * Get all task titles as an array
   * @returns {Promise<string[]>}
   */
  async getAllTaskTitles() {
    const taskElements = await this.taskItems.locator('.MuiListItemText-root > span').all();
    const titles = [];
    for (const element of taskElements) {
      titles.push(await element.textContent());
    }
    return titles;
  }

  /**
   * Clear all tasks (for cleanup in tests)
   */
  async clearAllTasks() {
    const count = await this.getTaskCount();
    for (let i = 0; i < count; i++) {
      // Always delete the first item since the list updates
      const firstTask = this.taskItems.first();
      const deleteButton = firstTask.locator('[data-testid="delete-button"]');
      await deleteButton.click();
      await this.page.waitForTimeout(300);
    }
  }
}

module.exports = { TodoPage };
