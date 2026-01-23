# ESLint Rule Troubleshooting

Common issues and debugging techniques.

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "afterAll is not defined" | RuleTester not configured for test runner | Set `RuleTester.afterAll = afterAll` BEFORE creating instance |
| Fix not applied | `meta.fixable` not set | Add `fixable: "code"` to meta object |
| Suggestions not showing | `meta.hasSuggestions` missing | Add `hasSuggestions: true` to meta |
| Type info unavailable | Missing parser options | Configure `parserOptions.projectService` |
| Test timeout | Type-aware rule slow | Use `projectService.allowDefaultProject` |
| "Unknown rule" | Plugin not registered | Check plugin is in config's `plugins` object |
| Fix creates syntax error | Invalid range or text | Use AST explorer to verify node boundaries |
| `__dirname` undefined | ESM module context | Use `import.meta.dirname` instead |
| Parser not found | Using `require()` in ESM | Use `import parser from '@typescript-eslint/parser'` |

## Debugging Techniques

### Log AST Node Structure

```typescript
create(context) {
  return {
    CallExpression(node) {
      console.log(JSON.stringify(node, null, 2));
    },
  };
}
```

### Check Text Being Replaced

```typescript
create(context) {
  return {
    Identifier(node) {
      console.log("Text:", context.sourceCode.getText(node));
      console.log("Range:", node.range);
    },
  };
}
```

### Verify Token Boundaries

```typescript
create(context) {
  const sourceCode = context.sourceCode;
  return {
    CallExpression(node) {
      const before = sourceCode.getTokenBefore(node);
      const after = sourceCode.getTokenAfter(node);
      console.log({ before, node, after });
    },
  };
}
```

### Check Scope Information

```typescript
create(context) {
  return {
    Identifier(node) {
      const scope = context.sourceCode.getScope(node);
      console.log("Scope type:", scope.type);
      console.log("Variables:", scope.variables.map(v => v.name));
    },
  };
}
```

## AST Exploration Tools

### AST Explorer (Web)

https://astexplorer.net

1. Select parser: `@typescript-eslint/parser`
2. Paste code sample
3. Click nodes to see structure
4. Use for understanding node types and properties

### ast-grep (CLI)

```bash
# Find pattern in codebase
sg --lang ts -p 'console.log($MSG)'

# Interactive mode
sg --lang ts -p 'console.$METHOD($ARGS)' --interactive

# Show AST for file
sg --lang ts --debug-query 'console.log' file.ts
```

### ESLint Debug Mode

```bash
# See which rules are running
DEBUG=eslint:* npx eslint file.ts

# See rule timing
TIMING=1 npx eslint file.ts
```

## Fix Debugging

### Verify Fix Range

```typescript
fix(fixer) {
  console.log("Node range:", node.range);
  console.log("Node text:", context.sourceCode.getText(node));
  return fixer.replaceText(node, "replacement");
}
```

### Multiple Fix Conflict

If multiple fixes conflict (overlapping ranges), only one applies. Debug by:

```typescript
fix(fixer) {
  const fixes = [
    fixer.insertTextBefore(node, "a"),
    fixer.insertTextAfter(node, "b"),
  ];
  console.log("Fixes:", fixes.map(f => ({ range: f.range, text: f.text })));
  return fixes;
}
```

### Fix Not Applying

1. Check `meta.fixable: "code"` is set
2. Check fix function returns a value (not undefined)
3. Check ranges don't overlap with other fixes
4. Run with `--fix-dry-run` to see what would change

```bash
npx eslint --fix-dry-run --format json file.ts
```

## Type-Aware Rule Issues

### "You have used a rule which requires parserServices"

The rule uses type information but the config doesn't provide it.

**Fix:** Add to eslint.config.js:

```javascript
{
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
}
```

### Type Information is Wrong

1. Check tsconfig.json includes the file
2. Check `tsconfigRootDir` points to correct location
3. Restart ESLint (type info is cached)

### Slow Type-Aware Rules

Type-aware rules are slower because they load the TypeScript program.

**Optimizations:**
- Use `projectService.allowDefaultProject` in tests
- Limit type-aware rules to specific file patterns
- Consider if type info is actually needed

## Test Debugging

### See Full Error Output

```typescript
// In test file
ruleTester.run("rule-name", rule, {
  invalid: [
    {
      code: `bad code`,
      errors: [
        {
          messageId: "errorId",
          // Add all properties to see what's wrong
          line: 1,
          column: 1,
          endLine: 1,
          endColumn: 10,
          data: { name: "expected" },
        },
      ],
    },
  ],
});
```

### Test Expected Output Mismatch

If `output` doesn't match, the test shows a diff. Common causes:

1. **Whitespace:** Output must match exactly, including newlines
2. **Quotes:** Single vs double quotes matter
3. **Semicolons:** Check if rule adds/removes them

### Isolate Failing Test

```typescript
// Bun
it.only("test name", ...)

// Vitest
it.only("test name", ...)

// Jest
it.only("test name", ...)
```

Or use `RuleTester.itOnly`:

```typescript
RuleTester.itOnly = it.only;
```

## Performance Issues

### Rule is Slow

1. **Exit early:** Check preconditions before expensive operations
2. **Cache lookups:** Store repeated `getScope()` or type lookups
3. **Use selectors:** CSS selectors are optimized; prefer over manual filtering
4. **Avoid reparse:** Don't call `getText()` on entire source repeatedly

```typescript
// BAD: Checks all identifiers
Identifier(node) {
  if (node.name === "target") { /* ... */ }
}

// GOOD: Selector filters first
"Identifier[name='target']"(node) {
  /* ... */
}
```

### Tests are Slow

1. Use `projectService.allowDefaultProject` for type-aware tests
2. Run specific test file, not entire suite
3. Consider if type-awareness is needed for all tests
