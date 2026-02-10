# UI Guidelines

This document outlines the user interface design guidelines and standards for the TODO application.

## Design System

### Component Library
- **Use Material-UI (MUI)** as the primary component library
- Version: Material-UI v5 or later
- All interactive components should use MUI components when available
- Custom components should follow Material Design principles

### Installation
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

## Color Palette

### Primary Colors
- **Primary**: `#1976d2` (Blue) - For primary actions and branding
- **Primary Light**: `#42a5f5` - For hover states
- **Primary Dark**: `#1565c0` - For active states

### Secondary Colors
- **Secondary**: `#9c27b0` (Purple) - For secondary actions
- **Secondary Light**: `#ba68c8` - For hover states
- **Secondary Dark**: `#7b1fa2` - For active states

### Semantic Colors
- **Success**: `#2e7d32` (Green) - For completed tasks
- **Error**: `#d32f2f` (Red) - For delete actions and errors
- **Warning**: `#ed6c02` (Orange) - For warnings
- **Info**: `#0288d1` (Light Blue) - For informational messages

### Neutral Colors
- **Background**: `#fafafa` - Main background
- **Surface**: `#ffffff` - Card/container backgrounds
- **Text Primary**: `rgba(0, 0, 0, 0.87)` - Main text
- **Text Secondary**: `rgba(0, 0, 0, 0.6)` - Secondary text
- **Divider**: `rgba(0, 0, 0, 0.12)` - Borders and dividers

## Typography

### Font Family
- **Primary Font**: 'Roboto', sans-serif (default Material-UI font)
- Ensure Roboto font is loaded via Google Fonts or npm package

### Font Sizes and Weights
- **H4 (34px, 400)**: Page title "TODO App"
- **H6 (20px, 500)**: Section headers if needed
- **Body1 (16px, 400)**: Task text, default body text
- **Body2 (14px, 400)**: Helper text, placeholders
- **Button (14px, 500)**: All button text (uppercase)

### Text Styles
- **Completed Tasks**: Apply strikethrough with `text-decoration: line-through`
- **Completed Tasks Color**: Use `text.secondary` color to dim completed tasks

## Component Styles

### Buttons

#### Add Task Button
- **Component**: `<Button variant="contained" color="primary">`
- **Size**: Default or medium
- **Text**: "Add Task" or "Add"
- **Icon**: Optional `<AddIcon />` from MUI icons

#### Delete Button
- **Component**: `<IconButton color="error">`
- **Icon**: `<DeleteIcon />` from MUI icons
- **Size**: Small
- **Aria-label**: "Delete task"

### Input Fields

#### Task Input
- **Component**: `<TextField variant="outlined">`
- **Full Width**: Yes
- **Placeholder**: "What needs to be done?"
- **Label**: Optional "New Task"
- **Auto-focus**: Recommended for better UX

### Checkboxes

#### Task Completion Checkbox
- **Component**: `<Checkbox color="primary">`
- **Size**: Default
- **Icon**: Default check/uncheck icons
- **Checked State**: Controlled by task completion status

### Lists

#### Task List Container
- **Component**: `<List>` and `<ListItem>`
- **Dividers**: Use `divider` prop on `<ListItem>`
- **Secondary Action**: For delete button placement

### Cards/Containers

#### Main Container
- **Component**: `<Container maxWidth="sm">`
- **Padding**: Default Material-UI spacing (8px grid)
- **Background**: Use `<Paper elevation={3}>` for main app container

#### Paper Component
- **Elevation**: 2-3 for subtle shadow
- **Padding**: 3-4 (24-32px) for content areas
- **Border Radius**: Default (4px)

## Layout Guidelines

### Spacing
- Use Material-UI spacing system (multiples of 8px)
- **Standard Spacing Units**:
  - `spacing(1)` = 8px
  - `spacing(2)` = 16px
  - `spacing(3)` = 24px
  - `spacing(4)` = 32px

### Container Structure
```
<Container maxWidth="sm">
  <Paper>
    <Box p={3}>
      [App Title]
      [Input Field + Add Button]
      [Task List]
    </Box>
  </Paper>
</Container>
```

### Margins and Padding
- **Page Padding**: 24-32px (spacing 3-4)
- **Section Spacing**: 16-24px (spacing 2-3) between major sections
- **Item Spacing**: 8-16px (spacing 1-2) between list items

## Responsive Design

### Breakpoints
- **Mobile**: < 600px - Full width with minimal padding
- **Tablet**: 600px - 960px - Medium container
- **Desktop**: > 960px - Small container (600px max-width)

### Mobile Considerations
- Touch targets minimum 48x48px
- Adequate spacing between interactive elements
- Font sizes remain readable without zooming
- Buttons stack vertically on very small screens if needed

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

#### Color Contrast
- Text must have minimum 4.5:1 contrast ratio against background
- Large text (18pt+) minimum 3:1 contrast ratio
- Interactive elements must be distinguishable

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus indicators must be visible (Material-UI provides default focus rings)
- Enter key should submit new tasks
- Escape key should clear input (optional enhancement)

#### Screen Reader Support
- Use semantic HTML elements
- Provide `aria-label` for icon-only buttons
- Use `aria-checked` for checkboxes (handled by MUI)
- Announce dynamic content changes with ARIA live regions when task added/deleted

#### ARIA Labels Required
```javascript
// Delete button
<IconButton aria-label="Delete task" />

// Checkbox
<Checkbox inputProps={{ 'aria-label': 'Mark task as complete' }} />

// Input field (provided by label or aria-label)
<TextField label="New Task" />
```

### Focus Management
- Focus new task input after adding a task
- Maintain logical focus order
- Visible focus indicators on all interactive elements

## Interaction States

### Hover States
- **Buttons**: Slight background color change (MUI default)
- **List Items**: Light gray background (`action.hover`)
- **Delete Icon**: Red color intensifies on hover

### Active/Pressed States
- Use Material-UI's built-in active states
- Ripple effects on button clicks (MUI default)

### Disabled States
- Disabled buttons use MUI's default disabled styling
- Reduced opacity and prevented pointer events

## Animation and Transitions

### Micro-interactions
- **Duration**: 200-300ms for most transitions
- **Easing**: MUI default easing curves
- **Ripple Effects**: Enable on all clickable elements (MUI default)

### Task Transitions
- Fade in when adding new tasks (optional)
- Slide out when deleting tasks (optional)
- Smooth checkbox transitions (MUI default)

### Loading States
- Use `<CircularProgress>` for async operations
- Display inline with actions or centered if full-page

## Error Handling UI

### Error Messages
- **Component**: `<Alert severity="error">` from MUI
- **Position**: Above task list or below input
- **Auto-dismiss**: Optional 5-second timeout
- **Message Examples**:
  - "Failed to load tasks. Please try again."
  - "Failed to add task. Please check your connection."
  - "Failed to delete task. Please try again."

### Validation Messages
- **Empty Task**: Show helper text or prevent submission
- **Helper Text**: Use TextField's `helperText` prop
- **Color**: Error color for validation failures

## Dark Mode (Future Enhancement)

### Theme Support
- Prepare for dark mode with MUI's `ThemeProvider`
- Use theme tokens instead of hardcoded colors
- Define both light and dark palette options

## Performance Guidelines

### Rendering
- Minimize unnecessary re-renders
- Use React.memo for task list items if list grows large
- Debounce input if implementing search/filter

### Animations
- Use CSS transforms for animations (better performance)
- Avoid animating expensive properties (width, height)
- Disable animations on low-end devices (optional)

## Code Examples

### Theme Configuration
```javascript
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

// Wrap app with ThemeProvider
<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### Component Usage Example
```javascript
<TextField
  fullWidth
  variant="outlined"
  placeholder="What needs to be done?"
  label="New Task"
  value={input}
  onChange={handleChange}
  onKeyPress={handleKeyPress}
/>
<Button
  variant="contained"
  color="primary"
  onClick={handleAddTask}
  startIcon={<AddIcon />}
>
  Add Task
</Button>
```

## Testing UI Components

### Visual Regression Testing
- Test component rendering across different states
- Verify accessibility attributes are present
- Check responsive behavior at key breakpoints

### Accessibility Testing
- Run axe-core or similar a11y testing tools
- Manual keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
