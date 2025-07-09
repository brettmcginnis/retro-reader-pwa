# Formatting

## Strings

### ✅ Good - Single quotes
```typescript
const message = 'Hello, world!';
const name = 'Alice';
import {Component} from '@angular/core';
```

### ❌ Bad - Double quotes (except when needed)
```typescript
const message = "Hello, world!";
```

### ✅ Good - Template literals for interpolation
```typescript
const greeting = `Hello, ${name}!`;
const multiline = `This is
  a multiline
  string`;
```

## Semicolons

### ✅ Good - Always use semicolons
```typescript
const user = getUser();
console.log(user.name);
return processData(user);
```

### ❌ Bad - Missing semicolons
```typescript
const user = getUser()
console.log(user.name)
return processData(user)
```

## Indentation

### ✅ Good - 2 spaces
```typescript
function calculateTotal(items: Item[]): number {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  return total;
}
```

## Braces

### ✅ Good - Always use braces
```typescript
if (condition) {
  doSomething();
}

for (const item of items) {
  process(item);
}
```

### ❌ Bad - Missing braces
```typescript
if (condition) doSomething();

for (const item of items)
  process(item);
```

## Line Length

### ✅ Good - Break long lines
```typescript
const result = await fetchUserData(userId)
  .then(data => processUserData(data))
  .then(processed => validateUserData(processed))
  .catch(error => handleError(error));

function createUser(
  name: string,
  email: string,
  role: UserRole,
  permissions: Permission[]
): User {
  // ...
}
```

## Object and Array Formatting

### ✅ Good
```typescript
// Single line for simple objects
const point = {x: 10, y: 20};

// Multi-line for complex objects
const user = {
  id: '123',
  name: 'Alice',
  email: 'alice@example.com',
  permissions: ['read', 'write'],
};

// Arrays
const numbers = [1, 2, 3, 4, 5];

const users = [
  {id: 1, name: 'Alice'},
  {id: 2, name: 'Bob'},
  {id: 3, name: 'Charlie'},
];
```

## Variable Declarations

### ✅ Good - One declaration per line
```typescript
const firstName = 'John';
const lastName = 'Doe';
const age = 30;
```

### ❌ Bad - Multiple declarations
```typescript
const firstName = 'John', lastName = 'Doe', age = 30;
```

## Whitespace

### ✅ Good - Consistent spacing
```typescript
// Around operators
const sum = a + b;
const result = x * y + z;

// After commas
function greet(name: string, title: string): void {
  console.log(name, title);
}

// Around braces
if (condition) {
  // ...
}
```

### ❌ Bad - Inconsistent spacing
```typescript
const sum=a+b;
const result = x*y + z;
function greet(name:string,title:string):void{
  console.log(name,title);
}
```

## Trailing Commas

### ✅ Good - Use trailing commas in multiline
```typescript
const config = {
  host: 'localhost',
  port: 3000,
  debug: true,  // Trailing comma
};

enum Status {
  Active,
  Inactive,
  Pending,  // Trailing comma
}
```