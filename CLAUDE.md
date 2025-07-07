# Claude Development Context

## Project Overview
Retro Reader PWA - A Progressive Web App for reading and bookmarking retro game guides with offline-first capabilities.

## Building features

1. First think through the problem, read the product `requiremtns`, and write a plan to tasks/todo.md
2. The plan should have a list of todo items that you can check off as you complete them
3. Then, begin working on the todo items, marking them as complete as you go.
4. Please every step of the way just give me a high level explanation of what changes you made
5. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
6. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.

## Development Guidelines

### Toast Notifications
- Use `showToast(type, title, message?, duration?)` for user feedback
- Use `showConfirmation(options)` for destructive actions
- All user feedback should use toasts instead of browser alerts

### Testing Approach
- Unit tests for services and utilities
- Integration tests for import/export functionality
- UI tests using React Testing Library for user interactions
- Toast system validation in all UI tests

## Testing Strategy

### Test Categories
1. **Unit Tests**: Individual functions and utilities
2. **Integration Tests**: Service interactions with database
3. **UI Tests**: Component behavior and user interactions
4. **E2E Scenarios**: Complete user workflows

### React Testing Library Best Practices

#### 1. Test Behavior, Not Implementation
- Focus on what users can see and do, not internal component details
- Avoid testing state, props, or component internals
- Test the component's output and behavior from a user's perspective

#### 2. Query Priority Order
Always prefer queries in this order:
1. **getByRole** - Matches ARIA roles (buttons, headings, form fields)
2. **getByLabelText** - For form controls with labels
3. **getByPlaceholderText** - For input fields with placeholders
4. **getByText** - For finding elements by visible text
5. **getByDisplayValue** - For form elements with current values
6. **getByTestId** - Only as a last resort

#### 3. Use the `screen` API
```typescript
// ❌ Avoid
const { getByText } = render(<Component />);

// ✅ Prefer
render(<Component />);
screen.getByText(/text/i);
```

#### 4. Use `userEvent` Over `fireEvent`
```typescript
// ❌ Avoid
fireEvent.click(button);

// ✅ Prefer
await userEvent.click(button);
```

#### 5. Async Testing Patterns
- Use `findBy` queries for elements that appear asynchronously
- Use `waitFor` for complex async logic or multiple conditions
- Avoid manual `act()` calls - RTL handles this automatically

#### 6. Test Organization
- Group related tests with `describe` blocks
- Test both happy paths and error states
- Cover edge cases and boundary conditions

#### 7. Example Test Pattern
```typescript
describe('Component', () => {
  it('should handle user interaction', async () => {
    render(<Component />);
    
    // Find elements using appropriate queries
    const button = screen.getByRole('button', { name: /submit/i });
    const input = screen.getByLabelText(/username/i);
    
    // Interact using userEvent
    await userEvent.type(input, 'test user');
    await userEvent.click(button);
    
    // Assert on behavior
    expect(await screen.findByText(/success/i)).toBeInTheDocument();
  });
});
```

### Test Commands
- `npm run test` - Run all tests
- `npm run test:ui` - Run UI tests only (tests in __tests__ folders)
- `npm run test:ui:watch` - Run UI tests in watch mode
- `npm run test:coverage` - Full test coverage report


## Build & Deployment
- **Dev**: `npm run dev`
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Test**: `npm run test` (Jest with React Testing Library)
- **Lint**: `npm run lint`
- **Type Check**: `npm run typecheck`

## Architecture Notes
- React 19 with TypeScript
- IndexedDB for offline-first data storage
- Vite for build tooling
- Context API for global state (app settings, toasts)
- Custom hooks for data management (guides, bookmarks, progress)
