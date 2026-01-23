# React/TypeScript Codemod Patterns

Patterns for transforming React components and TypeScript code with jscodeshift.

## Contents

- [Parser Configuration](#parser-configuration)
- [JSX Transformations](#jsx-transformations)
- [Hook Transformations](#hook-transformations)
- [Import Management](#import-management)
- [Component Transformations](#component-transformations)
- [TypeScript-Specific Patterns](#typescript-specific-patterns)

## Parser Configuration

Always use the TSX parser for React/TypeScript codebases:

```bash
npx jscodeshift -t transform.ts src/ --parser=tsx --extensions=ts,tsx
```

In tests, specify parser in options:

```typescript
defineTest(__dirname, "my-transform", { parser: "tsx" });
```

## JSX Transformations

### JSX Node Types

| Node Type | Represents | Example |
|-----------|------------|---------|
| `JSXElement` | Complete JSX element | `<Foo bar="baz">...</Foo>` |
| `JSXOpeningElement` | Opening tag | `<Foo bar="baz">` |
| `JSXClosingElement` | Closing tag | `</Foo>` |
| `JSXAttribute` | Props | `bar="baz"` |
| `JSXExpressionContainer` | JS expressions in JSX | `{value}` |
| `JSXSpreadAttribute` | Spread props | `{...props}` |
| `JSXIdentifier` | Element/attribute names | `Foo`, `bar` |

### Rename JSX Component

```typescript
// Change: <OldComponent /> → <NewComponent />

root
  .find(j.JSXIdentifier, { name: "OldComponent" })
  .forEach((path) => {
    path.node.name = "NewComponent";
  });
```

### Add Prop to Component

```typescript
// Change: <Button>Click</Button>
// To:     <Button variant="primary">Click</Button>

root
  .find(j.JSXOpeningElement, { name: { name: "Button" } })
  .filter((path) => {
    // Skip if prop already exists
    return !path.node.attributes.some(
      (attr) => attr.type === "JSXAttribute" && attr.name.name === "variant"
    );
  })
  .forEach((path) => {
    path.node.attributes.push(
      j.jsxAttribute(j.jsxIdentifier("variant"), j.literal("primary"))
    );
  });
```

### Rename Prop

```typescript
// Change: <Input onChange={...} /> → <Input onValueChange={...} />

root
  .find(j.JSXAttribute, { name: { name: "onChange" } })
  .filter((path) => {
    const element = path.parentPath.parentPath.node;
    return element.name.name === "Input";
  })
  .forEach((path) => {
    path.node.name.name = "onValueChange";
  });
```

### Remove Prop

```typescript
// Remove deprecated 'exact' prop from Route components

root
  .find(j.JSXAttribute, { name: { name: "exact" } })
  .filter((path) => {
    const element = path.parentPath.parentPath.node;
    return element.name.name === "Route";
  })
  .remove();
```

### Transform Prop Value

```typescript
// Change: <Route component={MyPage} />
// To:     <Route element={<MyPage />} />

root
  .find(j.JSXAttribute, { name: { name: "component" } })
  .filter((path) => {
    const element = path.parentPath.parentPath.node;
    return element.name.name === "Route";
  })
  .forEach((path) => {
    const componentValue = path.node.value.expression;

    // Change attribute name
    path.node.name.name = "element";

    // Wrap in JSX element
    path.node.value = j.jsxExpressionContainer(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier(componentValue.name), [], true),
        null,
        [],
        true
      )
    );
  });
```

## Hook Transformations

### Rename Hook

```typescript
// Change: const history = useHistory()
// To:     const navigate = useNavigate()

// First, find the import and track the local name
let localHistoryName = "useHistory";

root
  .find(j.ImportSpecifier, { imported: { name: "useHistory" } })
  .forEach((path) => {
    localHistoryName = path.node.local.name;
    path.node.imported.name = "useNavigate";
    path.node.local.name = "useNavigate";
  });

// Then find all call expressions using that name
root
  .find(j.CallExpression, { callee: { name: localHistoryName } })
  .forEach((path) => {
    path.node.callee.name = "useNavigate";
  });

// Update variable declarations
root
  .find(j.VariableDeclarator, {
    init: { callee: { name: "useNavigate" } },
  })
  .forEach((path) => {
    if (path.node.id.name === "history") {
      path.node.id.name = "navigate";
    }
  });
```

### Transform Hook Return Value Usage

```typescript
// Change: history.push('/path')
// To:     navigate('/path')

// Change: history.replace('/path')
// To:     navigate('/path', { replace: true })

root
  .find(j.CallExpression, {
    callee: {
      type: "MemberExpression",
      object: { name: "history" },
    },
  })
  .forEach((path) => {
    const methodName = path.node.callee.property.name;
    const args = path.node.arguments;

    if (methodName === "push") {
      path.replace(j.callExpression(j.identifier("navigate"), args));
    } else if (methodName === "replace") {
      const options = j.objectExpression([
        j.property("init", j.identifier("replace"), j.literal(true)),
      ]);
      path.replace(j.callExpression(j.identifier("navigate"), [...args, options]));
    }
  });
```

### Add Hook Import

```typescript
// Add useNavigate to existing react-router-dom import

const routerImport = root.find(j.ImportDeclaration, {
  source: { value: "react-router-dom" },
});

if (routerImport.size() > 0) {
  routerImport.forEach((path) => {
    const hasNavigate = path.node.specifiers.some(
      (spec) =>
        spec.type === "ImportSpecifier" && spec.imported.name === "useNavigate"
    );

    if (!hasNavigate) {
      path.node.specifiers.push(
        j.importSpecifier(j.identifier("useNavigate"))
      );
    }
  });
}
```

## Import Management

### Replace Import Source

```typescript
// Change: import { render } from 'enzyme'
// To:     import { render } from '@testing-library/react'

root
  .find(j.ImportDeclaration, { source: { value: "enzyme" } })
  .forEach((path) => {
    path.node.source.value = "@testing-library/react";
  });
```

### Split Import into Multiple

```typescript
// Change: import { useState, useEffect, memo } from 'react'
// To:     import { useState, useEffect } from 'react'
//         import { memo } from 'react'

root.find(j.ImportDeclaration, { source: { value: "react" } }).forEach((path) => {
  const hooks = [];
  const utilities = [];

  path.node.specifiers.forEach((spec) => {
    if (spec.type !== "ImportSpecifier") return;
    if (["useState", "useEffect", "useCallback", "useMemo"].includes(spec.imported.name)) {
      hooks.push(spec);
    } else {
      utilities.push(spec);
    }
  });

  if (hooks.length > 0 && utilities.length > 0) {
    path.node.specifiers = hooks;
    path.insertAfter(
      j.importDeclaration(utilities, j.literal("react"))
    );
  }
});
```

### Remove Unused Import Specifier

```typescript
// Remove 'useHistory' from imports if no longer used

const useHistoryCalls = root.find(j.CallExpression, {
  callee: { name: "useHistory" },
});

if (useHistoryCalls.size() === 0) {
  root
    .find(j.ImportSpecifier, { imported: { name: "useHistory" } })
    .remove();

  // Clean up empty import declarations
  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.specifiers.length === 0)
    .remove();
}
```

## Component Transformations

### Wrap Component with HOC

```typescript
// Change: export default MyComponent
// To:     export default withRouter(MyComponent)

root
  .find(j.ExportDefaultDeclaration)
  .filter((path) => path.node.declaration.type === "Identifier")
  .forEach((path) => {
    const componentName = path.node.declaration.name;
    path.node.declaration = j.callExpression(j.identifier("withRouter"), [
      j.identifier(componentName),
    ]);
  });
```

### Extract Inline Function to Named Component

```typescript
// Change: <Route element={<div>Hello</div>} />
// To:     <Route element={<HelloPage />} />
// (with HelloPage defined elsewhere)

// This is complex - often better to handle manually
// Codemods excel at mechanical transforms, not architectural changes
```

## TypeScript-Specific Patterns

### Handle Type Annotations

```typescript
// Change: const x: OldType = value
// To:     const x: NewType = value

root
  .find(j.TSTypeReference, { typeName: { name: "OldType" } })
  .forEach((path) => {
    path.node.typeName.name = "NewType";
  });
```

### Update Generic Type Parameters

```typescript
// Change: useState<OldType>(initial)
// To:     useState<NewType>(initial)

root
  .find(j.CallExpression, { callee: { name: "useState" } })
  .forEach((path) => {
    const typeParams = path.node.typeParameters;
    if (typeParams && typeParams.params.length > 0) {
      typeParams.params.forEach((param) => {
        if (param.typeName && param.typeName.name === "OldType") {
          param.typeName.name = "NewType";
        }
      });
    }
  });
```

### Add Type Annotation

```typescript
// Change: const navigate = useNavigate()
// To:     const navigate: NavigateFunction = useNavigate()

root
  .find(j.VariableDeclarator, {
    init: { callee: { name: "useNavigate" } },
  })
  .forEach((path) => {
    if (!path.node.id.typeAnnotation) {
      path.node.id.typeAnnotation = j.tsTypeAnnotation(
        j.tsTypeReference(j.identifier("NavigateFunction"))
      );
    }
  });
```

### Preserve Existing Type Annotations

When transforming nodes with type annotations, be careful to preserve them:

```typescript
// BAD: Loses type annotation
path.replace(j.identifier("newName"));

// GOOD: Preserve type annotation
const newId = j.identifier("newName");
newId.typeAnnotation = path.node.typeAnnotation;
path.replace(newId);
```

## Testing React Codemods

### Fixture Example: JSX Transform

**Input fixture** (`__testfixtures__/route-component.input.tsx`):

```tsx
import { Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";

function App() {
  return <Route path="/" component={HomePage} />;
}
```

**Output fixture** (`__testfixtures__/route-component.output.tsx`):

```tsx
import { Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";

function App() {
  return <Route path="/" element={<HomePage />} />;
}
```

### Fixture Example: Hook Migration

**Input fixture** (`__testfixtures__/use-history.input.tsx`):

```tsx
import { useHistory } from "react-router-dom";

function MyComponent() {
  const history = useHistory();

  const handleClick = () => {
    history.push("/dashboard");
  };

  return <button onClick={handleClick}>Go</button>;
}
```

**Output fixture** (`__testfixtures__/use-history.output.tsx`):

```tsx
import { useNavigate } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard");
  };

  return <button onClick={handleClick}>Go</button>;
}
```
