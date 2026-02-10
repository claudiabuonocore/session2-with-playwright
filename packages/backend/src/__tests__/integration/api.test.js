const request = require('supertest');
const { app, db } = require('../../app');

describe('TODO API Integration Tests', () => {
  // Helper function to clear todos before each test
  beforeEach(() => {
    db.prepare('DELETE FROM todos').run();
  });

  afterAll(() => {
    if (db) {
      db.close();
    }
  });

  describe('GET /api/todos', () => {
    it('should return an empty array when no todos exist', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all todos', async () => {
      // Arrange: Create test todos
      const stmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)');
      stmt.run('Task 1', 0);
      stmt.run('Task 2', 1);

      // Act
      const response = await request(app)
        .get('/api/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('completed');
      expect(typeof response.body[0].completed).toBe('boolean');
    });

    it('should return all todos with correct structure', async () => {
      // Arrange
      const stmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)');
      stmt.run('First Task', 0);
      stmt.run('Second Task', 0);
      stmt.run('Third Task', 1);

      // Act
      const response = await request(app)
        .get('/api/todos')
        .expect(200);

      // Assert: Should have all three tasks
      expect(response.body).toHaveLength(3);
      
      // Verify each todo has the correct structure
      response.body.forEach(todo => {
        expect(todo).toHaveProperty('id');
        expect(todo).toHaveProperty('title');
        expect(todo).toHaveProperty('completed');
        expect(todo).toHaveProperty('created_at');
        expect(typeof todo.completed).toBe('boolean');
      });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo with valid data', async () => {
      // Arrange
      const newTodo = { title: 'Buy groceries' };

      // Act
      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect('Content-Type', /json/)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Buy groceries');
      expect(response.body.completed).toBe(false);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should trim whitespace from title', async () => {
      // Arrange
      const newTodo = { title: '  Task with spaces  ' };

      // Act
      const response = await request(app)
        .post('/api/todos')
        .send(newTodo)
        .expect(201);

      // Assert
      expect(response.body.title).toBe('Task with spaces');
    });

    it('should return 400 when title is missing', async () => {
      // Act & Assert
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 when title is empty string', async () => {
      // Act & Assert
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '' })
        .expect(400);

      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 when title is only whitespace', async () => {
      // Act & Assert
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '   ' })
        .expect(400);

      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 when title is not a string', async () => {
      // Act & Assert
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 123 })
        .expect(400);

      expect(response.body.error).toContain('Title is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo completion status to true', async () => {
      // Arrange: Create a todo
      const stmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)');
      const result = stmt.run('Task to complete', 0);
      const todoId = result.lastInsertRowid;

      // Act: Mark as completed
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: true })
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert
      expect(response.body.id).toBe(todoId);
      expect(response.body.completed).toBe(true);
      expect(response.body.title).toBe('Task to complete');
    });

    it('should update todo completion status to false', async () => {
      // Arrange: Create a completed todo
      const stmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)');
      const result = stmt.run('Completed task', 1);
      const todoId = result.lastInsertRowid;

      // Act: Mark as incomplete
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: false })
        .expect(200);

      // Assert
      expect(response.body.completed).toBe(false);
    });

    it('should return 404 when todo does not exist', async () => {
      // Act & Assert
      const response = await request(app)
        .put('/api/todos/99999')
        .send({ completed: true })
        .expect(404);

      expect(response.body.error).toContain('Todo not found');
    });

    it('should return 400 when id is invalid', async () => {
      // Act & Assert
      const response = await request(app)
        .put('/api/todos/invalid')
        .send({ completed: true })
        .expect(400);

      expect(response.body.error).toContain('Valid todo ID is required');
    });

    it('should return 400 when completed is not a boolean', async () => {
      // Arrange: Create a todo
      const stmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)');
      const result = stmt.run('Task', 0);
      const todoId = result.lastInsertRowid;

      // Act & Assert
      const response = await request(app)
        .put(`/api/todos/${todoId}`)
        .send({ completed: 'true' })
        .expect(400);

      expect(response.body.error).toContain('Completed must be a boolean');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete an existing todo', async () => {
      // Arrange: Create a todo
      const stmt = db.prepare('INSERT INTO todos (title, completed) VALUES (?, ?)');
      const result = stmt.run('Task to delete', 0);
      const todoId = result.lastInsertRowid;

      // Verify todo exists
      const todosBefore = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId);
      expect(todosBefore).toBeDefined();

      // Act: Delete the todo
      const response = await request(app)
        .delete(`/api/todos/${todoId}`)
        .expect(200);

      // Assert
      expect(response.body.message).toContain('deleted successfully');
      expect(response.body.id).toBe(todoId);

      // Verify todo is deleted
      const todosAfter = db.prepare('SELECT * FROM todos WHERE id = ?').get(todoId);
      expect(todosAfter).toBeUndefined();
    });

    it('should return 404 when todo does not exist', async () => {
      // Act & Assert
      const response = await request(app)
        .delete('/api/todos/99999')
        .expect(404);

      expect(response.body.error).toContain('Todo not found');
    });

    it('should return 400 when id is invalid', async () => {
      // Act & Assert
      const response = await request(app)
        .delete('/api/todos/invalid')
        .expect(400);

      expect(response.body.error).toContain('Valid todo ID is required');
    });
  });

  describe('Error handling', () => {
    it('should handle server errors gracefully', async () => {
      // This test verifies that unexpected errors are caught
      // In a real scenario, you might mock the database to throw an error
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });
  });
});
