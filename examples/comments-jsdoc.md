# Comments and JSDoc

## JSDoc for Public APIs

### ✅ Good - Document public interfaces
```typescript
/**
 * Represents a user in the system.
 */
export interface User {
  /** Unique identifier for the user. */
  id: string;
  
  /** User's display name. */
  name: string;
  
  /** User's email address. Must be unique. */
  email: string;
}

/**
 * Fetches user data from the API.
 * 
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to the user data
 * @throws {NotFoundError} If the user doesn't exist
 * @throws {NetworkError} If the request fails
 * 
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export async function fetchUser(userId: string): Promise<User> {
  // Implementation
}
```

## Implementation Comments

### ✅ Good - Explain why, not what
```typescript
// Use // for implementation comments
function processPayment(amount: number): void {
  // Round to 2 decimal places to avoid floating point errors
  const roundedAmount = Math.round(amount * 100) / 100;
  
  // Stripe requires amount in cents
  const stripeAmount = roundedAmount * 100;
}
```

### ❌ Bad - Obvious comments
```typescript
// Set name to 'John'
const name = 'John';

// Increment counter by 1
counter++;

// Return the result
return result;
```

## TODO Comments

Are only meant to be temporary, work is not considered complete with TODO's remaining

### ✅ Good - With context
```typescript
// TODO(username): Implement caching to improve performance
// See: https://github.com/org/repo/issues/123
function fetchData(): Promise<Data> {
  return api.getData();
}
```

### ❌ Bad - Vague TODOs
```typescript
// TODO: Fix this
// FIXME: This is broken
```

## File Headers

### ✅ Good - When needed
```typescript
/**
 * @fileoverview User authentication utilities.
 * Provides functions for login, logout, and session management.
 */
```

## Type Comments

### ✅ Good - Complex type explanations
```typescript
/**
 * Maps user IDs to their permission sets.
 * Key: User ID
 * Value: Set of permission strings
 */
type UserPermissions = Map<string, Set<string>>;

/** Represents a coordinate in 3D space (x, y, z). */
type Point3D = [number, number, number];
```

## Deprecation

### ✅ Good - Clear deprecation notices
```typescript
/**
 * @deprecated Use {@link fetchUserV2} instead. Will be removed in v3.0.
 */
export function fetchUser(id: string): User {
  // ...
}
```

## Parameter Documentation

### ✅ Good - Document complex parameters
```typescript
interface SearchOptions {
  /** Maximum number of results to return. */
  limit?: number;
  
  /** Skip this many results (for pagination). */
  offset?: number;
  
  /** Sort field and direction. */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * Searches for users matching the given criteria.
 * 
 * @param query - Search query string
 * @param options - Search configuration options
 */
function searchUsers(query: string, options?: SearchOptions): User[] {
  // ...
}
```

## Avoid Over-Documentation

### ❌ Bad - Don't document TypeScript types
```typescript
/**
 * @param {string} name - The user's name  // TypeScript already knows this
 * @returns {number} The user's age        // TypeScript already knows this
 */
function getAge(name: string): number {
  // ...
}
```

### ✅ Good - Let TypeScript handle types
```typescript
/**
 * Calculates user's age based on their profile.
 * Returns -1 if birth date is not available.
 */
function getAge(name: string): number {
  // ...
}
