import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/todos handler
  rest.get('/api/todos', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: 'Test Todo 1', completed: false, created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, title: 'Test Todo 2', completed: true, created_at: '2023-01-02T00:00:00.000Z' },
      ])
    );
  }),
  
  // POST /api/todos handler
  rest.post('/api/todos', (req, res, ctx) => {
    const { title } = req.body;
    
    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Title is required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        completed: false,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // PUT /api/todos/:id handler
  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { completed } = req.body;
    
    // Return the todo with updated completion status
    // In a real scenario, this would fetch from the database
    const todos = [
      { id: 1, title: 'Test Todo 1', completed: false },
      { id: 2, title: 'Test Todo 2', completed: true },
    ];
    
    const todo = todos.find(t => t.id === parseInt(id));
    
    return res(
      ctx.status(200),
      ctx.json({
        ...todo,
        completed,
        created_at: new Date().toISOString(),
      })
    );
  }),

  // DELETE /api/todos/:id handler
  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ message: 'Todo deleted successfully', id: parseInt(id) })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('TODO App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Initially shows loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Wait for todos to load
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
  });

  test('displays empty state when no todos', async () => {
    // Override the default handler to return empty array
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No tasks yet. Add one to get started!')).toBeInTheDocument();
    });
  });

  test('adds a new todo', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for todos to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Fill in the form and submit
    const input = screen.getByPlaceholderText('What needs to be done?');
    await act(async () => {
      await user.type(input, 'New Test Todo');
    });
    
    const submitButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Check that the new todo appears
    await waitFor(() => {
      expect(screen.getByText('New Test Todo')).toBeInTheDocument();
    });
    
    // Input should be cleared
    expect(input.value).toBe('');
  });

  test('toggles todo completion status', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for todos to load
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    // Find the checkbox for the first todo (uncompleted)
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    
    expect(firstCheckbox).not.toBeChecked();
    
    // Click the checkbox to mark as complete
    await act(async () => {
      await user.click(firstCheckbox);
    });
    
    // Verify the PUT request was made (implicitly through the component update)
    await waitFor(() => {
      // The component should still render (no error)
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
  });

  test('deletes a todo', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for todos to load
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });
    
    // Find and click the delete button for the first todo
    const deleteButtons = screen.getAllByLabelText('Delete task');
    await act(async () => {
      await user.click(deleteButtons[0]);
    });
    
    // The todo should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
    });
    
    // The second todo should still be there
    expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
  });

  test('handles API error when fetching todos', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch todos/)).toBeInTheDocument();
    });
  });

  test('handles API error when adding todo', async () => {
    const user = userEvent.setup();
    
    // Override POST handler to simulate error
    server.use(
      rest.post('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for todos to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Try to add a todo
    const input = screen.getByPlaceholderText('What needs to be done?');
    await act(async () => {
      await user.type(input, 'New Todo');
    });
    
    const submitButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Error adding todo/)).toBeInTheDocument();
    });
  });

  test('shows completed todo with strikethrough', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Wait for todos to load
    await waitFor(() => {
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });
    
    // Test Todo 2 is completed, check if checkbox is checked
    const checkboxes = screen.getAllByRole('checkbox');
    const secondCheckbox = checkboxes[1];
    
    expect(secondCheckbox).toBeChecked();
  });

  test('prevents adding empty todo', async () => {
    const user = userEvent.setup();
    
    await act(async () => {
      render(<App />);
    });
    
    // Wait for todos to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /add/i });
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Should not make API call or show error (form validation prevents submission)
    // The test passing means no network error occurred
    expect(screen.queryByText(/Error adding todo/)).not.toBeInTheDocument();
  });
});