# React Code Style Guide

This guide outlines React best practices and code style conventions for the Retro Reader PWA project. All code should follow these patterns to ensure maintainability, performance, and consistency.

## Core Principles

### 1. Simplicity First
- Every change should impact as little code as possible
- Avoid over-engineering or complex abstractions
- Choose clarity over cleverness
- Make code self-documenting

### 2. Component Architecture

#### Component Categories
Organize components by their responsibilities:

- **UI Components** (`/components/*View.tsx`): Pure presentational components that receive props and render UI
- **Container Components** (`/containers/*.tsx`): Components that manage state and business logic
- **Context Providers** (`/contexts/*.tsx`): Global state management components
- **Modal Components** (`/components/*Modal.tsx`): Specialized UI for overlays
- **Shared Utilities** (`/hooks/*.ts`): Custom hooks for reusable logic

#### Container/Presentational Pattern
```typescript
// Container: Manages state and logic
// containers/GuideLibraryContainer.tsx
export const GuideLibraryContainer = () => {
  const { guides, loading } = useGuides();
  const { showToast } = useToast();
  
  const handleDelete = async (id: string) => {
    try {
      await deleteGuide(id);
      showToast('success', 'Guide deleted');
    } catch (error) {
      showToast('error', 'Failed to delete');
    }
  };
  
  return <GuideLibraryView guides={guides} onDelete={handleDelete} />;
};

// View: Pure presentation
// components/GuideLibraryView.tsx
interface GuideLibraryViewProps {
  guides: Guide[];
  onDelete: (id: string) => void;
}

export const GuideLibraryView: React.FC<GuideLibraryViewProps> = ({ 
  guides, 
  onDelete 
}) => {
  return (
    <div className="guide-library">
      {guides.map(guide => (
        <GuideCard key={guide.id} guide={guide} onDelete={onDelete} />
      ))}
    </div>
  );
};
```

## 3. Code Organization

### File Structure
```
src/
    components/       # Presentational components
    containers/       # Container components
    contexts/        # React contexts
    hooks/           # Custom hooks
    services/        # Business logic & API
    types/           # TypeScript types
    utils/           # Helper functions
```

### Import Order
Maintain consistent import ordering:
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';

// 3. Internal imports - types
import { Guide, Bookmark } from '../types';

// 4. Internal imports - hooks
import { useGuides } from '../hooks/useGuides';

// 5. Internal imports - components
import { GuideCard } from './GuideCard';

// 6. Internal imports - styles
import './GuideLibrary.css';
```

### Naming Conventions
- **Components**: PascalCase (e.g., `GuideReader`, `BookmarkManager`)
- **Files**: Match component name (e.g., `GuideReader.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useBookmarks`)
- **Utils**: camelCase (e.g., `formatFileSize`)
- **Types/Interfaces**: PascalCase (e.g., `Guide`, `BookmarkProps`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

## 4. React Patterns

### Functional Components with TypeScript
Always use functional components with proper TypeScript interfaces:

```typescript
interface GuideCardProps {
  guide: Guide;
  onRead: () => void;
  onDelete: () => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({ 
  guide, 
  onRead, 
  onDelete 
}) => {
  return (
    <div className="guide-card">
      <h3>{guide.title}</h3>
      <button onClick={onRead}>Read</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  );
};
```

### Custom Hooks
Extract complex logic into custom hooks:

```typescript
export const useBookmarks = (guideId?: string) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await db.getBookmarks(guideId);
      setBookmarks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  return { bookmarks, loading, error, refresh: loadBookmarks };
};
```

### Props Best Practices
```typescript
// Use shorthand for boolean props
<Modal isOpen />

// Omit curly braces for string props
<Button text="Submit" />

// L Avoid unnecessary curly braces
<Button text={"Submit"} />

// Use object shorthand
const title = "My Guide";
<GuideCard title={title} />

// Destructure props
export const GuideCard: React.FC<Props> = ({ title, author }) => {
  // ...
};
```

## 5. State Management

### State Categories
Organize state by its purpose:
- **Local UI State**: Component-specific (useState)
- **Shared UI State**: Cross-component (Context API)
- **Server Cache**: API data (custom hooks with IndexedDB)
- **Form State**: Controlled inputs
- **Navigation State**: Current view/route

### useState Best Practices
```typescript
// Group related state
const [formData, setFormData] = useState({
  title: '',
  author: '',
  content: ''
});

// Avoid excessive state variables
const [title, setTitle] = useState('');
const [author, setAuthor] = useState('');
const [content, setContent] = useState('');
```

### Context Usage
Use Context API for truly global state:

```typescript
// Good use cases
- User preferences (theme, settings)
- Toast notifications
- Authentication state

// Avoid for
- Data that could be passed as props
- Component-specific state
```

## 6. Performance Optimization

### React.memo
Use for expensive pure components:

```typescript
export const GuideCard = React.memo<GuideCardProps>(({ guide, onRead }) => {
  return (
    <div className="guide-card">
      {/* Expensive rendering */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return prevProps.guide.id === nextProps.guide.id;
});
```

### useMemo and useCallback
```typescript
// Memoize expensive calculations
const sortedGuides = useMemo(
  () => guides.sort((a, b) => b.dateModified - a.dateModified),
  [guides]
);

// Stabilize function references
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query);
}, []);

// L Don't overuse for simple operations
const sum = useMemo(() => a + b, [a, b]); // Unnecessary
```

### Key Prop Best Practices
```typescript
// Use stable, unique IDs
{guides.map(guide => (
  <GuideCard key={guide.id} guide={guide} />
))}

// L Avoid array indices as keys (unless list is static)
{guides.map((guide, index) => (
  <GuideCard key={index} guide={guide} />
))}
```

## 7. Error Handling

### Error Boundaries
Wrap major sections with error boundaries:

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling
```typescript
const handleSubmit = async () => {
  try {
    setLoading(true);
    await saveGuide(formData);
    showToast('success', 'Guide saved');
  } catch (error) {
    showToast('error', 'Failed to save guide');
    console.error('Save error:', error);
  } finally {
    setLoading(false);
  }
};
```

### User Feedback
Always provide feedback for user actions:

```typescript
// Use toast system for all feedback
showToast('success', 'Bookmark added');
showToast('error', 'Failed to load guide');

// L Never use browser alerts
alert('Success!'); // Don't do this
```

## 8. TypeScript Best Practices

### Interface Definitions
```typescript
// Define clear interfaces
interface Guide {
  id: string;
  title: string;
  content: string;
  author?: string; // Optional properties
  dateCreated: Date;
}

// Extend interfaces for variants
interface GuideWithBookmarks extends Guide {
  bookmarks: Bookmark[];
}

// Use type for unions
type ToastType = 'success' | 'error' | 'warning' | 'info';
```

### Generic Components
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div className="list">
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
```

## 9. Security Best Practices

### XSS Prevention
```typescript
// Escape HTML when using dangerouslySetInnerHTML
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Only use when absolutely necessary
<div dangerouslySetInnerHTML={{ __html: escapeHtml(userContent) }} />

// L Never trust user input directly
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

### Input Validation
```typescript
// Validate and sanitize all user inputs
const validateGuideContent = (content: string): boolean => {
  if (!content || content.length === 0) return false;
  if (content.length > MAX_CONTENT_LENGTH) return false;
  // Additional validation as needed
  return true;
};
```

## 10. Component Patterns

### Compound Components
For complex UI with multiple parts:

```typescript
const Modal = ({ children }) => { /* ... */ };
Modal.Header = ({ children }) => { /* ... */ };
Modal.Body = ({ children }) => { /* ... */ };
Modal.Footer = ({ children }) => { /* ... */ };

// Usage
<Modal>
  <Modal.Header>Edit Bookmark</Modal.Header>
  <Modal.Body>{/* form */}</Modal.Body>
  <Modal.Footer>{/* buttons */}</Modal.Footer>
</Modal>
```

### Render Props (when needed)
```typescript
interface RenderGuideProps {
  render: (guide: Guide) => React.ReactNode;
}

const GuideProvider: React.FC<RenderGuideProps> = ({ render }) => {
  const guide = useGuide();
  return <>{render(guide)}</>;
};
```

## 11. Code Quality Checklist

Before committing code, ensure:

- [ ] Components are small and focused (< 150 lines)
- [ ] Props interfaces are clearly defined
- [ ] No inline styles or magic numbers
- [ ] Error cases are handled with user feedback
- [ ] Complex logic is extracted to hooks
- [ ] Code follows existing patterns in the codebase
- [ ] TypeScript types are properly defined
- [ ] No `any` types without justification
- [ ] Tests cover main user interactions
- [ ] Linting and type checking pass

## Summary

Remember: **Simplicity is key**. When in doubt, choose the simpler solution that's easier to understand and maintain. Every line of code should have a clear purpose and contribute to the user experience.
