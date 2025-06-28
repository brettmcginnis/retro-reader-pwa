# Claude Development Context

## Project Overview
Retro Reader PWA - A Progressive Web App for reading and bookmarking retro game guides with offline-first capabilities.

## Recent Major Changes

### Toast Notification System Implementation
**Date**: 2025-01-26
**Context**: Replaced all browser `alert()` and `confirm()` calls with a modern toast notification system

**Changes Made**:
1. **Created Toast System**:
   - `src/contexts/ToastContext.tsx` - React context for toast management
   - `src/types/index.ts` - Added Toast and ConfirmationOptions types
   - `src/styles/main.css` - Added comprehensive toast styling with theme support

2. **Replaced All Alerts** (18 locations):
   - `src/components/GuideReader.tsx` (4 locations) - bookmark actions, settings
   - `src/components/GuideLibrary.tsx` (12 locations) - import/export, validation
   - `src/components/BookmarkManager.tsx` - export and action feedback
   - `src/services/importExportService.ts` (2 locations) - backup restoration

3. **Replaced Confirm Dialogs** (3 locations):
   - Guide deletion confirmation
   - Guide replacement during import
   - Bookmark deletion and clear all confirmations

4. **Integration**:
   - Added ToastProvider to App component hierarchy
   - Updated all components to use `useToast` hook
   - Service layer modified to support confirmation callbacks

### Export/Import Bug Fix
**Issue**: Export/import functionality broken due to JSON date validation
**Root Cause**: `validateImportData` was checking `instanceof Date` but JSON.parse converts dates to strings
**Fix**: Updated validation to handle both Date objects and valid date strings

## Development Guidelines

### Toast Notifications
- Use `showToast(type, title, message?, duration?)` for user feedback
- Types: 'success' | 'error' | 'warning' | 'info'
- Use `showConfirmation(options)` for destructive actions
- All user feedback should use toasts instead of browser alerts

### Testing Approach
- Unit tests for services and utilities
- Integration tests for import/export functionality
- UI tests using React Testing Library for user interactions
- Toast system validation in all UI tests

### Code Quality
- TypeScript strict mode enabled
- ESLint with React plugins
- All tests must pass before commits
- Type checking with `npm run typecheck`

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

### GitHub Actions Integration
- **Integrated Test Job**: UI tests run as part of the main `test.yml` workflow
- **Simple Execution**: No complex coverage or reporting overhead
- **Runs on**: Main branch pushes and all pull requests

### Key Test Areas
- Import/export functionality with valid/invalid data
- Toast notification display and interactions
- Confirmation modal workflows
- File upload/download operations
- Error handling and edge cases

## Build & Deployment
- **Dev**: `npm run dev`
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Test**: `npm run test` (Jest with React Testing Library)
- **Lint**: `npm run lint`
- **Type Check**: `npm run typecheck`

## Known Issues
- Test files excluded from TypeScript compilation due to Jest type conflicts
- PWA service worker registration for GitHub Pages deployment

## Architecture Notes
- React 19 with TypeScript
- IndexedDB for offline-first data storage
- Vite for build tooling
- Context API for global state (app settings, toasts)
- Custom hooks for data management (guides, bookmarks, progress)