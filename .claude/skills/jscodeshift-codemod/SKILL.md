---
name: jscodeshift-codemod
description: Write jscodeshift codemods for TypeScript/JavaScript transformations. Use when creating automated code migrations, refactoring patterns, or transforming React components. Handles AST navigation, import management, hook migrations, and TypeScript/TSX transformations.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# jscodeshift Codemod Writer

You are an expert at writing jscodeshift codemods for automated code transformations. This skill guides you through creating robust, well-tested codemods that follow established patterns.

## When to Use This Skill

- Creating automated migrations (e.g., library upgrades, API changes)
- Refactoring code patterns across a codebase
- Transforming React components or hooks
- Updating TypeScript types or interfaces
- Batch renaming or restructuring code

## Codemod Creation Process

### Step 1: Understand the Transformation

Before writing code, clarify:
- **What pattern are we transforming?** (before → after examples)
- **What files should be targeted?** (extensions, directories)
- **What edge cases exist?** (optional props, nested structures, etc.)
- **Should any cases be flagged for manual review?** (TODO comments)

### Step 2: Create the Transformer File

**Location**: `codemods/descriptive-name.ts`

**File Structure**:

```typescript
/**
 * Codemod: [Descriptive Name]
 *
 * [Brief description of what this codemod does]
 *
 * Transformations:
 * - [List each transformation this codemod performs]
 * - [e.g., "Converts useHistory() to useNavigate()"]
 * - [e.g., "Updates history.push() calls to navigate()"]
 *
 * Usage:
 *   npx jscodeshift -t codemods/[filename].ts [target] --extensions=tsx,ts,jsx,js --parser=tsx
 */

import type {
  API,
  FileInfo,
  Options,
  Collection,
  JSCodeshift,
  ImportDeclaration,
  // Import other types as needed
} from 'jscodeshift';

export const parser = 'tsx';

export default function transformer(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasModifications = false;

  // Transformation logic goes here
  // Use multiple passes for complex transformations

  // Only return modified source if changes were made
  return hasModifications ? root.toSource() : file.source;
}
```

### Step 3: Implement Transformations

Use these patterns for common operations:

#### Finding Nodes

```typescript
// Find all import declarations
root.find(j.ImportDeclaration)

// Find with specific properties
root.find(j.CallExpression, {
  callee: {
    type: 'Identifier',
    name: 'useHistory'
  }
})

// Find using a filter function
root.find(j.JSXElement)
  .filter(path => {
    const name = path.value.openingElement.name;
    return name.type === 'JSXIdentifier' && name.name === 'Link';
  })

// Find variable declarations
root.find(j.VariableDeclarator, {
  id: { type: 'Identifier', name: 'variableName' }
})
```

#### Import Management

```typescript
// Find imports from a specific module
const imports = root.find(j.ImportDeclaration, {
  source: { value: 'old-module' }
});

// Update import source
imports.forEach(path => {
  path.value.source.value = 'new-module';
  hasModifications = true;
});

// Add a new import specifier
imports.forEach(path => {
  const specifiers = path.value.specifiers || [];
  const hasSpecifier = specifiers.some(
    s => s.type === 'ImportSpecifier' && s.imported.name === 'NewThing'
  );

  if (!hasSpecifier) {
    specifiers.push(
      j.importSpecifier(j.identifier('NewThing'))
    );
    hasModifications = true;
  }
});

// Remove an import specifier
imports.forEach(path => {
  if (path.value.specifiers) {
    path.value.specifiers = path.value.specifiers.filter(
      s => !(s.type === 'ImportSpecifier' && s.imported.name === 'OldThing')
    );
    hasModifications = true;
  }
});

// Remove empty imports
imports.forEach(path => {
  if (!path.value.specifiers || path.value.specifiers.length === 0) {
    j(path).remove();
  }
});
```

#### Tracking Variables

```typescript
// Track variables assigned from hook calls
const navigateVars = new Set<string>();

root.find(j.VariableDeclarator, {
  init: {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'useNavigate' }
  }
}).forEach(path => {
  if (path.value.id.type === 'Identifier') {
    navigateVars.add(path.value.id.name);
  }
});

// Use tracked variables later
root.find(j.CallExpression)
  .filter(path => {
    const callee = path.value.callee;
    return callee.type === 'Identifier' && navigateVars.has(callee.name);
  })
  .forEach(path => {
    // Transform calls to tracked variables
  });
```

#### JSX Transformations

```typescript
// Transform JSX element props
root.find(j.JSXElement)
  .filter(path => {
    const name = path.value.openingElement.name;
    return name.type === 'JSXIdentifier' && name.name === 'Link';
  })
  .forEach(path => {
    const attrs = path.value.openingElement.attributes || [];

    // Find a specific attribute
    const toProp = attrs.find(
      attr => attr.type === 'JSXAttribute' && attr.name.name === 'to'
    );

    if (toProp && toProp.type === 'JSXAttribute') {
      // Transform the attribute
      if (toProp.value?.type === 'JSXExpressionContainer') {
        // Handle expression values
        const expr = toProp.value.expression;
        // Transform expr...
      }
    }

    hasModifications = true;
  });

// Remove a JSX attribute
attrs = attrs.filter(
  attr => !(attr.type === 'JSXAttribute' && attr.name.name === 'oldProp')
);
```

#### Adding TODO Comments

When a transformation needs manual review:

```typescript
// Add a TODO comment to a node
path.value.comments = [
  j.commentBlock(' TODO: Check if this migration is correct ', true, false),
  ...(path.value.comments || [])
];
hasModifications = true;

// Add comment to specific location
const leadingComments = path.value.comments || [];
leadingComments.unshift(
  j.commentBlock(' TODO: Manual migration required for complex pattern ', true, false)
);
path.value.comments = leadingComments;
```

#### TypeScript Type Handling

```typescript
// Transform generic type arguments
root.find(j.CallExpression, {
  callee: { name: 'useParams' },
  typeParameters: {}
})
.forEach(path => {
  if (path.value.typeParameters) {
    const typeArg = path.value.typeParameters.params[0];

    // Convert useParams<T>() to useParams() as T
    const newCall = j.callExpression(path.value.callee, path.value.arguments);
    const asExpression = j.tsAsExpression(newCall, typeArg);

    j(path).replaceWith(asExpression);
    hasModifications = true;
  }
});

// Handle type annotations
root.find(j.VariableDeclarator)
  .filter(path => path.value.id.type === 'Identifier' && path.value.id.typeAnnotation)
  .forEach(path => {
    // Access type annotation
    const typeAnnotation = path.value.id.typeAnnotation;
    // Transform...
  });
```

#### Replacing Nodes

```typescript
// Replace a call expression
root.find(j.CallExpression, {
  callee: { name: 'oldFunction' }
})
.forEach(path => {
  const newCall = j.callExpression(
    j.identifier('newFunction'),
    path.value.arguments
  );

  j(path).replaceWith(newCall);
  hasModifications = true;
});

// Replace with multiple statements (requires finding statement parent)
root.find(j.ExpressionStatement)
  .filter(path => {
    return path.value.expression.type === 'CallExpression' &&
           path.value.expression.callee.name === 'oldFunc';
  })
  .forEach(path => {
    const newStatements = [
      j.expressionStatement(j.callExpression(j.identifier('newFunc1'), [])),
      j.expressionStatement(j.callExpression(j.identifier('newFunc2'), []))
    ];

    j(path).replaceWith(newStatements);
    hasModifications = true;
  });
```

#### Building New Nodes

```typescript
// Build a call expression
const callExpr = j.callExpression(
  j.identifier('functionName'),
  [j.stringLiteral('arg1'), j.identifier('arg2')]
);

// Build an object expression
const objExpr = j.objectExpression([
  j.property('init', j.identifier('key1'), j.stringLiteral('value1')),
  j.property('init', j.identifier('key2'), j.identifier('variable'))
]);

// Build a member expression (object.property)
const memberExpr = j.memberExpression(
  j.identifier('object'),
  j.identifier('property')
);

// Build JSX attribute
const jsxAttr = j.jsxAttribute(
  j.jsxIdentifier('propName'),
  j.jsxExpressionContainer(j.stringLiteral('value'))
);
```

### Step 4: Handle Edge Cases

Common patterns for robust codemods:

```typescript
// Check if node exists before accessing
root.find(j.SomeNode).forEach(path => {
  if (!path.value.property) return;
  // Safe to access path.value.property
});

// Preserve existing code structure
// - Keep comments when possible
// - Maintain formatting
// - Don't modify unrelated code

// Skip already-migrated code
const alreadyMigrated = root.find(j.ImportDeclaration, {
  source: { value: 'new-module' }
}).length > 0;

if (alreadyMigrated) {
  return file.source; // Return unchanged
}

// Handle both object and array patterns
if (path.value.id.type === 'ObjectPattern') {
  // Handle destructuring: const { a, b } = useHook()
} else if (path.value.id.type === 'Identifier') {
  // Handle simple assignment: const result = useHook()
}
```

### Step 5: Create Test File

**Location**: `codemods/__tests__/[codemod-name].test.ts`

**Test Structure**:

```typescript
import { describe } from 'bun:test';
import { defineInlineTest } from 'jscodeshift/dist/testUtils';
import transform from '../[codemod-name]';

describe('[codemod-name]', () => {
  defineInlineTest(
    { default: transform, parser: 'tsx' },
    {}, // options
    // Input code
    `
import { OldThing } from 'old-module';

function Component() {
  const old = OldThing();
  return <div />;
}
    `.trim(),
    // Expected output
    `
import { NewThing } from 'new-module';

function Component() {
  const old = NewThing();
  return <div />;
}
    `.trim(),
    'transforms OldThing to NewThing'
  );

  defineInlineTest(
    { default: transform, parser: 'tsx' },
    {},
    `
// Input for edge case
    `.trim(),
    `
// Expected output for edge case
    `.trim(),
    'handles edge case description'
  );

  defineInlineTest(
    { default: transform, parser: 'tsx' },
    {},
    // Input that should NOT be transformed
    `
import { NewThing } from 'new-module';
const x = NewThing();
    `.trim(),
    // Output should be identical
    `
import { NewThing } from 'new-module';
const x = NewThing();
    `.trim(),
    'skips already migrated code'
  );
});
```

**Run tests**:
```bash
bun test codemods/__tests__/[codemod-name].test.ts
```

### Step 6: Create Test Fixtures (Optional)

For complex transformations, use fixtures:

**Create files**:
- `codemods/__testfixtures__/[codemod-name].input.tsx` - Input code
- `codemods/__testfixtures__/[codemod-name].output.tsx` - Expected output

**Update test**:
```typescript
import { defineTest } from 'jscodeshift/dist/testUtils';

defineTest(__dirname, '[codemod-name]', {}, '[codemod-name]', { parser: 'tsx' });
```

### Step 7: Document Usage

Add usage instructions to the codemod file header:

```typescript
/**
 * Usage:
 *   # Single file
 *   npx jscodeshift -t codemods/[name].ts path/to/file.tsx --parser=tsx
 *
 *   # Directory
 *   npx jscodeshift -t codemods/[name].ts src/apps/dash --extensions=tsx,ts --parser=tsx
 *
 *   # Dry run
 *   npx jscodeshift -t codemods/[name].ts src --dry --print
 */
```

## Best Practices

1. **Always return `file.source` if no modifications were made** - Improves performance and avoids unnecessary reformatting

2. **Use `hasModifications` flag** - Track whether any changes were made

3. **Preserve code structure** - Don't reformat code unnecessarily

4. **Add TODO comments for manual review** - When automation is uncertain

5. **Test edge cases** - Empty files, already-migrated code, partial patterns

6. **Use TypeScript** - Leverage types from jscodeshift for safer transformations

7. **Set `parser = 'tsx'`** - Supports both TypeScript and JSX

8. **Keep transformations focused** - One codemod = one clear transformation

9. **Document transformations** - List what changes in the file header

10. **Handle both TSX and TS** - Use `--extensions=tsx,ts,jsx,js` when running

## Common Patterns Reference

### Multi-pass Transformations

```typescript
// Pass 1: Collect information
const tracker = new Set<string>();
root.find(j.SomePattern).forEach(path => {
  tracker.add(path.value.name);
});

// Pass 2: Use collected information
root.find(j.AnotherPattern).forEach(path => {
  if (tracker.has(path.value.name)) {
    // Transform
  }
});
```

### Conditional Transformations

```typescript
// Only transform if certain conditions are met
root.find(j.CallExpression).forEach(path => {
  const args = path.value.arguments;

  if (args.length === 1 && args[0].type === 'StringLiteral') {
    // Simple case: transform
    hasModifications = true;
  } else {
    // Complex case: add TODO
    path.value.comments = [
      j.commentBlock(' TODO: Complex arguments - review manually ', true, false)
    ];
    hasModifications = true;
  }
});
```

### Scoped Tracking

```typescript
// Track within a function scope
root.find(j.FunctionDeclaration).forEach(funcPath => {
  const localVars = new Set<string>();

  // Find variables in this function
  j(funcPath).find(j.VariableDeclarator).forEach(varPath => {
    if (varPath.value.id.type === 'Identifier') {
      localVars.add(varPath.value.id.name);
    }
  });

  // Transform only references to local variables
  j(funcPath).find(j.Identifier).forEach(idPath => {
    if (localVars.has(idPath.value.name)) {
      // Transform
    }
  });
});
```

## Running Codemods

After creating the codemod and tests:

1. **Run tests first**:
   ```bash
   bun test codemods/__tests__/[codemod-name].test.ts
   ```

2. **Dry run on target files**:
   ```bash
   npx jscodeshift -t codemods/[name].ts [target] --dry --print --parser=tsx
   ```

3. **Run on actual files**:
   ```bash
   npx jscodeshift -t codemods/[name].ts [target] --extensions=tsx,ts,jsx,js --parser=tsx
   ```

4. **Review changes**:
   ```bash
   git diff
   ```

5. **Search for TODO comments**:
   ```bash
   git grep "TODO.*migration" [target]
   ```

## Troubleshooting

- **No files matched**: Check file extensions and target path
- **Syntax errors**: Ensure `parser: 'tsx'` is set and source is valid
- **No transformations**: Check that `hasModifications` is set to `true`
- **Wrong output**: Use `console.log(JSON.stringify(path.value, null, 2))` to inspect AST
- **Type errors**: Import correct types from 'jscodeshift'

## AST Exploration

To understand what AST nodes to target:

```bash
# Use astexplorer.net with:
# - Parser: @babel/parser
# - Transform: jscodeshift

# Or print AST in codemod:
console.log(JSON.stringify(path.value, null, 2));
```

## Example Workflow

When user requests a codemod:

1. **Clarify the transformation** - Get before/after examples
2. **Read similar codemods** - Check existing codemods for patterns
3. **Write the transformer** - Follow the structure above
4. **Create tests** - Cover main case + edge cases
5. **Run tests** - Ensure they pass with `bun test`
6. **Show usage** - Provide the exact command to run the codemod

## Notes

- Use `sg` (ast-grep) for structural searches when exploring code
- Prefer strong TypeScript types over `any`
- Keep codemods focused and testable
- When in doubt, add TODO comments for manual review
