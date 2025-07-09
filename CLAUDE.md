# Claude Development Context

## Project Overview
Retro Reader PWA - A Progressive Web App for reading and bookmarking retro game guides with offline-first capabilities.

## Bash Commands
- `npm run build` Builds the project
- `npm run lint` Validates Syntax
- `npm run test` Runs tests
- `npm run test:coverage` Runs tests with code coverage output

## TypeScript Style Guide

Based on Google TypeScript Style Guide. See `examples/` for detailed examples.

### Core Principles
- Type safety first
- Explicit over implicit
- Consistent formatting
- Clear naming

### Quick Rules

#### Files
- UTF-8 encoding
- Use `.ts` extension
- One module per file

#### Imports/Exports
- Named exports only, no default exports
- Group imports: external, then internal
- See: `examples/imports-exports.md`

#### Naming
- Classes/Interfaces/Types: `UpperCamelCase`
- Functions/Variables: `lowerCamelCase`
- Constants: `CONSTANT_CASE`
- See: `examples/naming-conventions.md`

#### Types
- Avoid `any`, use `unknown`
- Prefer interfaces over type aliases
- Use type inference where obvious
- See: `examples/types-interfaces.md`

#### Formatting
- Single quotes for strings
- Semicolons required
- 2-space indentation
- See: `examples/formatting.md`

#### Control Flow
- Always use braces
- Use `===` and `!==`
- Handle errors explicitly
- See: `examples/control-flow.md`

#### Functions/Classes
- Arrow functions preferred
- Minimize class usage
- No function expressions
- See: `examples/functions-classes.md`

#### Comments
- JSDoc for public API
- `//` for implementation
- Write useful comments
- See: `examples/comments-jsdoc.md`

### Forbidden
- `eval()` and `Function()`
- `var` keyword
- `==` and `!=`
- Modifying prototypes
- Wrapper objects (`new String()`)

### Testing
- Type all test code
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)

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


## Workflow

1. Understand the problem described in the issue
2. Search the codebase for relevant files
3. Ultrathink through the ask, and form a list of tasks to address the issue
3. Implement the necessary changes to fix the issue
4. Write and run tests to verify the fix
5. Ensure code passes linting and building
6. Create a descriptive commit message

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
