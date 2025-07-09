# Naming Conventions

## Classes, Interfaces, Types, Enums

### ✅ Good - UpperCamelCase
```typescript
class UserService { }
interface UserProfile { }
type UserPermissions = 'read' | 'write' | 'admin';
enum HttpStatus { }
```

### ❌ Bad
```typescript
class userService { }
class user_service { }
interface IUserProfile { }  // No 'I' prefix
type TUserPermissions = string;  // No 'T' prefix
```

## Variables, Functions, Methods

### ✅ Good - lowerCamelCase
```typescript
const userName = 'John';
let isActive = true;
function getUserById(id: string) { }
class Service {
  fetchData() { }
}
```

### ❌ Bad
```typescript
const UserName = 'John';
const user_name = 'John';
function GetUserById(id: string) { }
```

## Constants

### ✅ Good - CONSTANT_CASE
```typescript
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT_MS = 5000;
```

### ❌ Bad
```typescript
const maxRetryCount = 3;
const apiBaseUrl = 'https://api.example.com';
```

## Private Members

### ✅ Good - Leading underscore discouraged
```typescript
class UserService {
  private userId: string;  // Prefer 'private' keyword
  
  private getUserData() { }
}
```

### ❌ Bad
```typescript
class UserService {
  private _userId: string;  // Avoid underscore
  
  _getUserData() { }
}
```

## File Names

### ✅ Good - Descriptive, lowercase with hyphens
```typescript
user.service.ts
user-profile.component.ts
date.utils.ts
api-response.model.ts
```

### ❌ Bad
```typescript
UserService.ts
user_service.ts
userService.ts
```

## Descriptive Names

### ✅ Good - Clear and meaningful
```typescript
function calculateTotalPrice(items: Item[]): number { }
const isUserAuthenticated = true;
class AuthenticationService { }
```

### ❌ Bad - Abbreviations and unclear names
```typescript
function calc(items: Item[]): number { }
const flag = true;
class AuthSvc { }
const d = new Date();  // What is 'd'?
```

## Boolean Names

### ✅ Good - Use is/has/can prefixes
```typescript
const isLoading = true;
const hasPermission = false;
const canEdit = true;
```

### ❌ Bad
```typescript
const loading = true;
const permission = false;
const edit = true;
```