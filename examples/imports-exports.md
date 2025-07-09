# Imports and Exports

## File Structure Order
```typescript
// 1. Copyright (if applicable)
// 2. @fileoverview JSDoc
// 3. Imports
// 4. Implementation
```

## Imports

### ✅ Good - Named imports
```typescript
import {Component, OnInit} from '@angular/core';
import {UserService} from './services/user.service';
import {User, UserRole} from './models/user.model';
```

### ❌ Bad - Default imports
```typescript
import React from 'react';
import UserService from './services/user.service';
```

### Import Ordering
```typescript
// 1. External modules first
import {Component} from '@angular/core';
import {Observable} from 'rxjs';

// 2. Internal modules
import {UserService} from '../services/user.service';
import {formatDate} from '../utils/date.utils';

// 3. Types/interfaces
import type {User} from '../models/user.model';
```

## Exports

### ✅ Good - Named exports
```typescript
export class UserService {
  // ...
}

export interface User {
  id: string;
  name: string;
}

export function validateUser(user: User): boolean {
  return !!user.id && !!user.name;
}
```

### ❌ Bad - Default exports
```typescript
export default class UserService {
  // ...
}

export default {
  validateUser,
  formatUser
};
```

### Re-exports
```typescript
// index.ts - barrel exports
export {UserService} from './user.service';
export {User, UserRole} from './user.model';
export {validateUser} from './user.utils';
```

## Module Organization

### One class/interface per file
```typescript
// user.model.ts
export interface User {
  id: string;
  name: string;
}

// user.service.ts
export class UserService {
  getUser(id: string): User {
    // ...
  }
}
```

### Group related utilities
```typescript
// string.utils.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}