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
