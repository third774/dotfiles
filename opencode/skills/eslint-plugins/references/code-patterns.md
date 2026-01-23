# ESLint Rule Code Patterns

Reference for AST traversal, reporting, and fixing patterns.

## Rule Meta Object

```typescript
meta: {
  type: "problem",        // "problem" | "suggestion" | "layout"
  docs: {
    description: "What the rule does",
  },
  fixable: "code",        // Include only if auto-fixable
  hasSuggestions: true,   // Include only if has suggestions
  messages: {
    errorId: "Error with {{ placeholder }}",
    suggestId: "Suggestion message",
  },
  schema: [
    {
      type: "object",
      properties: {
        optionName: { type: "boolean" },
      },
      additionalProperties: false,
    },
  ],
}
```

| Type | Use Case |
|------|----------|
| `problem` | Code likely to cause errors |
| `suggestion` | Style improvement, not an error |
| `layout` | Whitespace, formatting |

## Context API

```typescript
create(context) {
  const options = context.options[0] ?? {};
  const sourceCode = context.sourceCode;

  // Get text
  const text = sourceCode.getText(node);

  // Get tokens
  const before = sourceCode.getTokenBefore(node);
  const after = sourceCode.getTokenAfter(node);

  // Get comments
  const comments = sourceCode.getCommentsBefore(node);

  // Get scope
  const scope = sourceCode.getScope(node);

  // Get ancestors
  const ancestors = sourceCode.getAncestors(node);

  return { /* visitors */ };
}
```

## AST Selectors

```typescript
create(context) {
  return {
    // Simple node type
    Identifier(node) { },

    // Exit visitor (after children processed)
    "FunctionDeclaration:exit"(node) { },

    // Attribute condition
    "CallExpression[callee.name='forbidden']"(node) { },

    // Multiple types
    "FunctionDeclaration, ArrowFunctionExpression"(node) { },

    // Child selector
    "CallExpression > Identifier[name='console']"(node) { },

    // Descendant selector
    "CallExpression Identifier[name='log']"(node) { },

    // Has selector (parent has matching child)
    "ImportDeclaration:has(ImportSpecifier[imported.name='deprecated'])"(node) { },

    // Literal value
    "Literal[value=true]"(node) { },

    // Not selector
    "CallExpression:not([callee.name='allowed'])"(node) { },
  };
}
```

## Reporting

### Basic Report

```typescript
context.report({
  node,
  messageId: "errorId",
});
```

### With Data Placeholders

```typescript
context.report({
  node,
  messageId: "errorWithData",
  data: {
    name: node.name,
    expected: "something",
  },
});
```

### With Specific Location

```typescript
context.report({
  node,
  loc: node.loc.start,  // or { line, column }
  messageId: "errorId",
});
```

### With Fix

```typescript
context.report({
  node,
  messageId: "fixable",
  fix(fixer) {
    return fixer.replaceText(node, "replacement");
  },
});
```

### With Multiple Fixes

```typescript
context.report({
  node,
  messageId: "multipleChanges",
  fix(fixer) {
    return [
      fixer.insertTextBefore(node, "prefix"),
      fixer.insertTextAfter(node, "suffix"),
    ];
  },
});
```

### With Suggestions

```typescript
context.report({
  node,
  messageId: "hasSuggestions",
  suggest: [
    {
      messageId: "suggestion1",
      fix(fixer) {
        return fixer.replaceText(node, "option1");
      },
    },
    {
      messageId: "suggestion2",
      data: { replacement: "option2" },
      fix(fixer) {
        return fixer.replaceText(node, "option2");
      },
    },
  ],
});
```

## Fixer API

```typescript
fix(fixer) {
  // Insert
  fixer.insertTextBefore(node, "text");
  fixer.insertTextAfter(node, "text");
  fixer.insertTextBeforeRange([start, end], "text");
  fixer.insertTextAfterRange([start, end], "text");

  // Remove
  fixer.remove(node);
  fixer.removeRange([start, end]);

  // Replace
  fixer.replaceText(node, "newText");
  fixer.replaceTextRange([start, end], "newText");
}
```

**Fix Constraints:**
- Fixes MUST be idempotent (running twice = running once)
- Multiple fixes MUST NOT have overlapping ranges
- Fixes MUST NOT change code behavior

## Type-Aware Rules (typescript-eslint v6+)

```typescript
import { ESLintUtils } from "@typescript-eslint/utils";
import * as ts from "typescript";

create(context) {
  const services = ESLintUtils.getParserServices(context);

  return {
    CallExpression(node) {
      // Get type directly (v6+ simplified API)
      const type = services.getTypeAtLocation(node);

      // Check type string
      if (services.program.getTypeChecker().typeToString(type) === "Promise<void>") {
        // Handle Promise
      }

      // Check symbol flags
      if (type.symbol?.flags & ts.SymbolFlags.Enum) {
        // Handle enum
      }

      // Get call signatures
      const signatures = type.getCallSignatures();
      if (signatures.length > 0) {
        const returnType = signatures[0].getReturnType();
      }
    },
  };
}
```

**Note:** The v6+ API (`services.getTypeAtLocation(node)`) replaces the verbose v5 pattern:
```typescript
// OLD (v5) - don't use
const checker = services.program.getTypeChecker();
const tsNode = services.esTreeNodeToTSNodeMap.get(node);
const type = checker.getTypeAtLocation(tsNode);
```

## Common Node Types

| Node Type | Represents | Example |
|-----------|------------|---------|
| `Identifier` | Names | `foo`, `myVar` |
| `CallExpression` | Function calls | `foo()`, `obj.method()` |
| `MemberExpression` | Property access | `obj.prop`, `arr[0]` |
| `ImportDeclaration` | Import statements | `import { x } from 'y'` |
| `ImportSpecifier` | Named imports | `{ x }` in import |
| `ImportDefaultSpecifier` | Default imports | `x` in `import x from` |
| `VariableDeclaration` | Variable declarations | `const x = 1` |
| `VariableDeclarator` | Individual variable | `x = 1` part |
| `FunctionDeclaration` | Named functions | `function foo() {}` |
| `ArrowFunctionExpression` | Arrow functions | `() => {}` |
| `ObjectExpression` | Object literals | `{ a: 1 }` |
| `ArrayExpression` | Array literals | `[1, 2]` |
| `Literal` | Primitives | `'str'`, `42`, `true` |
| `TemplateLiteral` | Template strings | `` `hello ${name}` `` |
| `JSXElement` | JSX tags | `<div>` |
| `TSTypeAnnotation` | Type annotations | `: string` |
