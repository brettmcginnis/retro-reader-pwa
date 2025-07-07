### Architecture Requirements

#### 1. Component Independence
- Individualize units of components so each is independent
- Components should not be affected by unrelated global state changes
- Minimize re-renders at all costs

#### 2. Separation of Concerns
- **Business Logic Components**: Handle state communication, data fetching, and state management
- **Presentational Components**: Focus purely on UI rendering, receive all data via props
- The business logic component passes presentational props to the presentational component

#### 3. State Management
- Use state management solutions (e.g., Redux) to isolate changes
- Ensure components only re-render when their specific data changes
- Avoid coupling components to global state unless absolutely necessary

### Implementation Pattern

```javascript
// Business Logic Component (Container)
const UserProfileContainer = () => {
  const userData = useSelector(selectUserData);
  const handleUpdate = (data) => {
    // Business logic here
  };
  
  return <UserProfile data={userData} onUpdate={handleUpdate} />;
};

// Presentational Component (Pure UI)
const UserProfile = ({ data, onUpdate }) => {
  // Pure UI logic only
  return <div>...</div>;
};
```

### Best Practices
1. Start by breaking down components into individual, independent units
2. Each component should have a single, well-defined responsibility
3. Components should be self-contained and not depend on external context unless explicitly passed as props
4. Design components to be easily testable in isolation
5. Avoid direct manipulation of global state within presentational components
