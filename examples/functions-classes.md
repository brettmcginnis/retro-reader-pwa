# Functions and Classes

## Arrow Functions

### ✅ Good - Prefer arrow functions
```typescript
const add = (a: number, b: number): number => a + b;

const users = data.map(item => ({
  id: item.id,
  name: item.name,
}));

class UserService {
  private handleError = (error: Error): void => {
    console.error(error);
  };
}
```

### ❌ Bad - Function expressions
```typescript
const add = function(a: number, b: number): number {
  return a + b;
};
```

## Function Declarations

### ✅ Good - For top-level functions
```typescript
function calculateTax(amount: number, rate: number): number {
  return amount * rate;
}

function async fetchUserData(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

## Function Parameters

### ✅ Good - Destructured parameters
```typescript
interface UserOptions {
  name: string;
  email: string;
  role?: string;
}

function createUser({name, email, role = 'user'}: UserOptions): User {
  return {id: generateId(), name, email, role};
}
```

### ✅ Good - Rest parameters
```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

## Classes

### ✅ Good - Minimal class usage
```typescript
class UserRepository {
  constructor(private readonly db: Database) {}
  
  async findById(id: string): Promise<User | null> {
    return this.db.users.findOne({id});
  }
  
  async save(user: User): Promise<void> {
    await this.db.users.save(user);
  }
}
```

### ❌ Bad - Overuse of classes
```typescript
// Don't use classes for simple utilities
class MathUtils {
  static add(a: number, b: number): number {
    return a + b;
  }
}

// Use functions instead
export function add(a: number, b: number): number {
  return a + b;
}
```

## Method Shorthand

### ✅ Good
```typescript
const obj = {
  name: 'Alice',
  greet() {
    return `Hello, ${this.name}`;
  },
};
```

### ❌ Bad
```typescript
const obj = {
  name: 'Alice',
  greet: function() {
    return `Hello, ${this.name}`;
  },
};
```

## Async Functions

### ✅ Good - async/await
```typescript
async function processUsers(userIds: string[]): Promise<User[]> {
  const users = await Promise.all(
    userIds.map(id => fetchUser(id))
  );
  
  return users.filter(user => user.isActive);
}
```

### ❌ Bad - Mixing promises and async/await
```typescript
async function processUsers(userIds: string[]): Promise<User[]> {
  return fetchUsers(userIds).then(users => {
    return users.filter(user => user.isActive);
  });
}
```

## Pure Functions

### ✅ Good - No side effects
```typescript
function calculateDiscount(price: number, discountRate: number): number {
  return price * (1 - discountRate);
}

function formatUser(user: User): FormattedUser {
  return {
    ...user,
    displayName: `${user.firstName} ${user.lastName}`,
  };
}
```

## Function Overloads

### ✅ Good - When necessary
```typescript
function parse(value: string): object;
function parse(value: string, reviver: (key: string, value: any) => any): object;
function parse(value: string, reviver?: (key: string, value: any) => any): object {
  return JSON.parse(value, reviver);
}
```

## Avoid `this`

### ✅ Good - Minimize this usage
```typescript
// Prefer pure functions
function processItems(items: Item[]): ProcessedItem[] {
  return items.map(transformItem);
}

// When using classes, arrow functions preserve context
class Component {
  private handleClick = (): void => {
    console.log('Clicked');
  };
}
```