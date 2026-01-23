# React/TypeScript Refactoring Patterns

Language-specific patterns for refactoring React and TypeScript code.

## Contents

- [React Components](#react-components)
- [TypeScript Type Safety](#typescript)
- [TypeScript Refactoring Checklist](#typescript-refactoring-checklist)

## React Components

**Structure order:**
```typescript
export function MyComponent({ prop1, prop2 }: Props) {
  // 1. Hooks (useState, useContext, custom hooks)
  const [state, setState] = useState(initialValue);
  const customData = useCustomHook();

  // 2. Derived state (useMemo for expensive computations)
  const derivedValue = useMemo(() => compute(state), [state]);

  // 3. Event handlers (useCallback for stability)
  const handleClick = useCallback(() => {
    setState(newValue);
  }, []);

  // 4. Effects (useEffect)
  useEffect(() => {
    // Side effects
  }, [dependency]);

  // 5. Render
  return <div onClick={handleClick}>{derivedValue}</div>;
}
```

**Component refactoring patterns:**
- Extract complex JSX into sub-components
- Use functional components with hooks (not class components)
- Memoize expensive operations with `useMemo`
- Stabilize callbacks with `useCallback`
- Extract custom hooks for shared logic

**When to extract a component:**
- JSX block is used multiple times
- JSX block is >20 lines and has clear responsibility
- Logic can be reused across components

## TypeScript

**Type safety patterns:**
```typescript
// Use interface for objects
interface User {
  id: string;
  name: string;
}

// Use type for unions/intersections
type Status = 'pending' | 'success' | 'error';
type UserWithStatus = User & { status: Status };

// Leverage utility types
type PartialUser = Partial<User>;
type UserName = Pick<User, 'name'>;
type UserWithoutId = Omit<User, 'id'>;

// Type guards for runtime checks
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string'
  );
}

// Avoid any
function processDataBad(data: any) { } // Bad

// Use unknown with type guards
function processData(data: unknown) {
  if (isUser(data)) {
    // data is User here
  }
}
```

## TypeScript Refactoring Checklist

- [ ] Replace `any` with specific types or `unknown`
- [ ] Add type guards for runtime validation
- [ ] Use utility types instead of manual type construction
- [ ] Prefer `interface` for objects, `type` for unions
- [ ] Enable strict mode if not already enabled
