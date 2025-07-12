# Claude Development Context

## Project Overview
Retro Reader PWA - A Progressive Web App for reading and bookmarking retro game guides with offline-first capabilities.

## Workflow

1. Using gh cli, retrieve the and read the issue
1. Understand the problem described in the issue
2. Search the codebase for relevant files
3. Ultrathink through the ask, and form a list of tasks.
5. Using git, Checkout an appropriate branch
6. Address each task sequentially and ensure test and lint passes before proceeding to the next task.
7. Commit the change with an appropriate commit message. Do not include claude as a co-author.
8. Push the changes
9. Create a Pull request

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.
Remember to use the git CLI (`git`) for all git-related tasks.

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
- Avoid redundant JSX comments for already-extracted components
- Extract reusable UI sections into dedicated components instead of using comments
- See: `examples/comments-jsdoc.md`

#### Component Extraction
- Extract reusable UI sections into dedicated components
- Avoid inline JSX comments that describe UI sections (e.g., `{/* Header */}`, `{/* Navigation Button */}`)
- Create small, focused components for better reusability
- Write comprehensive tests for all extracted components
- Use descriptive component names that reflect their purpose

### Forbidden
- `eval()` and `Function()`
- `var` keyword
- `==` and `!=`
- Modifying prototypes
- Wrapper objects (`new String()`)
- Skipping Tests

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

## React Hooks Best Practices

### useEffect Guidelines

#### When NOT to Use useEffect

**1. Transforming Data for Rendering**
- Calculate values directly during rendering instead of using Effects
- If something can be calculated from existing props or state, don't put it in state
- Use `useMemo` only for expensive computations that need caching

```typescript
// ❌ Bad: Using Effect to transform data
useEffect(() => {
  setFullName(firstName + ' ' + lastName);
}, [firstName, lastName]);

// ✅ Good: Calculate during rendering
const fullName = firstName + ' ' + lastName;
```

**2. Handling User Events**
- Event-specific logic belongs in event handlers, not Effects
- Process user interactions directly in onClick, onSubmit, etc.

```typescript
// ❌ Bad: Using Effect for event handling
useEffect(() => {
  if (submitted) {
    post('/api/register', data);
  }
}, [submitted]);

// ✅ Good: Handle in event handler
const handleSubmit = () => {
  post('/api/register', data);
};
```

**3. Resetting State**
- Use the `key` prop to reset component state
- Calculate state directly instead of syncing with Effects

```typescript
// ❌ Bad: Using Effect to reset state
useEffect(() => {
  setSelection(null);
}, [userId]);

// ✅ Good: Use key prop
<ProfilePage key={userId} />
```

#### When to Use useEffect

**Proper Use Cases:**
- Connecting to external systems (WebSocket, browser APIs, third-party libraries)
- Setting up subscriptions and event listeners
- Synchronizing with non-React widgets
- Fetching data (though consider framework solutions first)

```typescript
// ✅ Good: Connecting to external system
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  
  return () => {
    connection.disconnect();
  };
}, [roomId]);
```

#### Common Anti-Patterns to Avoid

1. **Chains of Effects** - Avoid Effects that trigger other Effects
2. **Missing Dependencies** - Always include all dependencies
3. **Suppressing Linter Warnings** - Fix the root cause instead
4. **Not Implementing Cleanup** - Always clean up subscriptions and connections

#### Best Practices

1. **Think of Effects as Independent Processes**
   - Each Effect should handle one concern
   - Design around a single setup/cleanup cycle

2. **Effects Run Multiple Times**
   - Make Effects resilient to re-execution
   - Don't assume they run only once

3. **Prefer Alternatives**
   - Event handlers for user interactions
   - Direct calculations during rendering
   - Framework-specific data fetching solutions
   - Custom Hooks for reusable logic

4. **Keep Effects Simple**
   - If an Effect does too much, split it
   - Extract complex logic into functions

Remember: **"If you're not trying to synchronize with some external system, you probably don't need an Effect."**
