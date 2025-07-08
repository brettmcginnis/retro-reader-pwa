# Claude Development Context

## Project Overview
Retro Reader PWA - A Progressive Web App for reading and bookmarking retro game guides with offline-first capabilities.

## Building features

1. First think through the problem, read the product `requirements/*.md`, and write a plan to tasks/todo.md
2. The plan should have a list of todo items that you can check off as you complete them
3. Then, begin working on the todo items, marking them as complete as you go.
4. A task is not considered complete until `npm run test`, and `npm run lint` pass
5. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes.
6. Add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.

## Testing Requirements

### Code Coverage
- **Minimum code coverage: 80%** for all metrics (statements, branches, functions, lines)
- Run tests with coverage before committing: `npm run test:coverage`
- All new code must include comprehensive tests
- Coverage thresholds are enforced - builds will fail if coverage drops below 80%

### Testing Best Practices
- Write tests that focus on behavior, not implementation details
- Follow existing test patterns for consistency
- Mock external dependencies appropriately
- Ensure all async operations are properly handled in tests

### Pre-commit Checklist
1. Run linting: `npm run lint`
2. Run type checking: `npm run typecheck`
3. Run tests with coverage: `npm run test:coverage`
4. Ensure all tests pass and coverage meets 80% threshold
