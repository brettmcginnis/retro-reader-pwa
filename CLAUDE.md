# Claude Development Context

## Project Overview
Retro Reader PWA - A Progressive Web App for reading and bookmarking retro game guides with offline-first capabilities.

## Recent Major Changes

### Reading Position Tracking Fix
**Date**: 2025-01-29
**Context**: Fixed issue where reading position wasn't saved during natural scrolling

**Changes Made**:
1. **Updated Scroll Handler**:
   - Modified `handleScroll` in GuideReader to calculate current line from scroll position
   - Added `setCurrentLine(currentLineFromScroll)` to track position during scrolling
   - Position now saves automatically after scrolling stops

2. **Improved Initial Position Restore**:
   - Enhanced initial scroll logic to ensure saved position is restored
   - Added explicit state updates when restoring position

3. **Added Test Coverage**:
   - New test: "should track current line when scrolling naturally"
   - Validates position tracking during scroll events

**Result**: Reading position is now properly saved and restored when users scroll through guides

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