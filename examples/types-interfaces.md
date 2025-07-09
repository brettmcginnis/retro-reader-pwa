# Types and Interfaces

## Prefer Interfaces Over Type Aliases

### ✅ Good - Use interfaces for objects
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

### ✅ Good - Use type aliases for unions/intersections
```typescript
type Status = 'active' | 'inactive' | 'pending';
type ID = string | number;
type PartialUser = Partial<User>;
```

## Avoid `any`

### ✅ Good - Use `unknown` or specific types
```typescript
function processData(data: unknown): void {
  if (typeof data === 'string') {
    console.log(data.toUpperCase());
  }
}

function parseJson(json: string): unknown {
  return JSON.parse(json);
}
```

### ❌ Bad
```typescript
function processData(data: any): void {
  console.log(data.whatever.property);  // No type safety
}
```

## Type Inference

### ✅ Good - Let TypeScript infer obvious types
```typescript
const name = 'John';  // Inferred as string
const count = 42;     // Inferred as number
const users = [];     // Needs annotation: const users: User[] = []

function double(n: number) {
  return n * 2;  // Return type inferred as number
}
```

### ❌ Bad - Over-annotating
```typescript
const name: string = 'John';  // Redundant
const count: number = 42;     // Redundant
```

## Array Types

### ✅ Good
```typescript
// Simple types: use T[]
const numbers: number[] = [1, 2, 3];
const names: string[] = ['Alice', 'Bob'];

// Complex types: use Array<T>
const users: Array<User> = [];
const promises: Array<Promise<string>> = [];
```

## Optional Properties and Parameters

### ✅ Good
```typescript
interface User {
  id: string;
  name: string;
  email?: string;  // Optional property
}

function greet(name: string, title?: string): string {
  return title ? `Hello, ${title} ${name}` : `Hello, ${name}`;
}
```

## Type Guards

### ✅ Good
```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && 
         obj !== null &&
         'id' in obj &&
         'name' in obj;
}

function processUser(data: unknown): void {
  if (isUser(data)) {
    console.log(data.name);  // Type-safe access
  }
}
```

## Generics

### ✅ Good - Meaningful generic names
```typescript
interface Container<TItem> {
  items: TItem[];
  add(item: TItem): void;
}

function first<TElement>(arr: TElement[]): TElement | undefined {
  return arr[0];
}
```

### ❌ Bad - Single letter generics (except T)
```typescript
interface Container<X> {  // Use descriptive names
  items: X[];
}
```

## Union Types

### ✅ Good
```typescript
type Result<T> = { success: true; data: T } | { success: false; error: string };

function processResult(result: Result<User>): void {
  if (result.success) {
    console.log(result.data.name);
  } else {
    console.error(result.error);
  }
}
```

## Never Use Wrapper Objects

### ❌ Bad
```typescript
const str = new String('hello');
const num = new Number(42);
const bool = new Boolean(true);
```

### ✅ Good
```typescript
const str = 'hello';
const num = 42;
const bool = true;
```