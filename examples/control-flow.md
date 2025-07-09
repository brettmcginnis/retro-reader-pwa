# Control Flow

## Equality Operators

### ✅ Good - Use === and !==
```typescript
if (value === null) {
  // ...
}

if (status !== 'active') {
  // ...
}

if (typeof value === 'string') {
  // ...
}
```

### ❌ Bad - Never use == or !=
```typescript
if (value == null) {  // Don't use ==
  // ...
}

if (status != 'active') {  // Don't use !=
  // ...
}
```

## If Statements

### ✅ Good - Always use braces
```typescript
if (isValid) {
  processData();
}

if (user.role === 'admin') {
  grantAccess();
} else {
  denyAccess();
}

if (score > 90) {
  grade = 'A';
} else if (score > 80) {
  grade = 'B';
} else {
  grade = 'C';
}
```

### ❌ Bad - No braces
```typescript
if (isValid) processData();

if (condition)
  doSomething();
else
  doSomethingElse();
```

## Loops

### ✅ Good - for...of for arrays
```typescript
const items = ['apple', 'banana', 'orange'];

for (const item of items) {
  console.log(item);
}

// With index when needed
for (const [index, item] of items.entries()) {
  console.log(index, item);
}
```

### ✅ Good - for...in for objects (with hasOwnProperty)
```typescript
const user = {name: 'Alice', age: 30};

for (const key in user) {
  if (user.hasOwnProperty(key)) {
    console.log(key, user[key]);
  }
}
```

### ✅ Good - Traditional for loop when needed
```typescript
for (let i = 0; i < array.length; i++) {
  if (shouldSkip(array[i])) {
    continue;
  }
  process(array[i]);
}
```

## Switch Statements

### ✅ Good - With proper breaks and default
```typescript
switch (action.type) {
  case 'INCREMENT':
    return state + 1;
  case 'DECREMENT':
    return state - 1;
  case 'RESET':
    return 0;
  default:
    return state;
}
```

### ❌ Bad - Fall-through without comment
```typescript
switch (action.type) {
  case 'INCREMENT':
    state++;  // Missing break/return
  case 'DECREMENT':
    state--;
    break;
}
```

## Error Handling

### ✅ Good - Specific error handling
```typescript
try {
  const data = await fetchUserData(userId);
  return processData(data);
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    return null;
  }
  throw error;  // Re-throw unknown errors
}
```

### ❌ Bad - Empty catch blocks
```typescript
try {
  doSomething();
} catch (error) {
  // Don't ignore errors
}
```

## Early Returns

### ✅ Good - Guard clauses
```typescript
function processUser(user: User | null): string {
  if (!user) {
    return 'No user provided';
  }
  
  if (!user.isActive) {
    return 'User is inactive';
  }
  
  // Main logic here
  return `Processing user: ${user.name}`;
}
```

### ❌ Bad - Deep nesting
```typescript
function processUser(user: User | null): string {
  if (user) {
    if (user.isActive) {
      // Main logic deeply nested
      return `Processing user: ${user.name}`;
    } else {
      return 'User is inactive';
    }
  } else {
    return 'No user provided';
  }
}
```

## Ternary Operators

### ✅ Good - Simple conditions
```typescript
const status = isActive ? 'active' : 'inactive';
const message = user ? `Hello, ${user.name}` : 'Hello, guest';
```

### ❌ Bad - Complex or nested ternaries
```typescript
const result = condition1 ? value1 : condition2 ? value2 : condition3 ? value3 : value4;
```