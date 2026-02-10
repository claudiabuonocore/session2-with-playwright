import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Alert,
  CircularProgress,
  ThemeProvider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import theme from './theme';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setTodos(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch todos: ' + err.message);
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTodo }),
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const result = await response.json();
      setTodos([result, ...todos]);
      setNewTodo('');
      setError(null);
    } catch (err) {
      setError('Error adding todo: ' + err.message);
      console.error('Error adding todo:', err);
    }
  };

  const handleToggle = async (todoId, currentStatus) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos(todos.map(todo => 
        todo.id === todoId ? updatedTodo : todo
      ));
      setError(null);
    } catch (err) {
      setError('Error updating todo: ' + err.message);
      console.error('Error updating todo:', err);
    }
  };

  const handleDelete = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(todos.filter(todo => todo.id !== todoId));
      setError(null);
    } catch (err) {
      setError('Error deleting todo: ' + err.message);
      console.error('Error deleting todo:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3}>
          <Box p={3}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              TODO App
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom align="center" sx={{ mb: 3 }}>
              Keep track of your tasks
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="What needs to be done?"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={handleKeyPress}
                  data-testid="task-input"
                  autoFocus
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<AddIcon />}
                  data-testid="add-task-button"
                  sx={{ minWidth: '120px' }}
                >
                  Add
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <List data-testid="task-list">
                {todos.length > 0 ? (
                  todos.map((todo) => (
                    <ListItem
                      key={todo.id}
                      data-testid="task-item"
                      divider
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => handleToggle(todo.id, todo.completed)}
                        color="primary"
                        data-testid="task-checkbox"
                        inputProps={{ 'aria-label': 'Mark task as complete' }}
                      />
                      <ListItemText
                        primary={todo.title}
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'text.secondary' : 'text.primary',
                        }}
                      />
                      <IconButton
                        edge="end"
                        aria-label="Delete task"
                        onClick={() => handleDelete(todo.id)}
                        color="error"
                        data-testid="delete-button"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))
                ) : (
                  <Box p={3} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      No tasks yet. Add one to get started!
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;