# ESLint Rule Test Patterns

Reference for RuleTester configuration and test case patterns.

## RuleTester Setup by Framework

### Bun

```typescript
// src/rules/__tests__/rule-name.test.ts
import { afterAll, describe, it } from "bun:test";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../rule-name";

// Configure BEFORE creating instance
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run("rule-name", rule, {
  valid: [],
  invalid: [],
});
```

**Optional preload setup** (bunfig.toml):
```toml
[test]
preload = ["./test-setup.ts"]
```

```typescript
// test-setup.ts
import { afterAll, describe, it } from "bun:test";
import { RuleTester } from "@typescript-eslint/rule-tester";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
```

### Vitest

```typescript
// src/rules/__tests__/rule-name.test.ts
import * as vitest from "vitest";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../rule-name";

// Configure BEFORE creating instance
RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

ruleTester.run("rule-name", rule, {
  valid: [],
  invalid: [],
});
```

**If using `globals: true`** in vitest.config.ts, you only need:
```typescript
RuleTester.afterAll = afterAll;
```

### Jest

```typescript
// src/rules/__tests__/rule-name.test.ts
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../rule-name";

// Jest globals work automatically - no setup needed

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

ruleTester.run("rule-name", rule, {
  valid: [],
  invalid: [],
});
```

## Type-Aware Rule Testing

For rules that use type information:

```typescript
import parser from "@typescript-eslint/parser";

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      projectService: {
        allowDefaultProject: ["*.ts*"],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

**Note:** Use `import.meta.dirname` (ESM) instead of `__dirname` (CJS).

## Valid Test Cases

```typescript
valid: [
  // Simple string
  `const x = 1;`,

  // Object with name (recommended for clarity)
  {
    code: `const x = 1;`,
    name: "allows basic assignment",
  },

  // With options
  {
    code: `const x = 1;`,
    options: [{ allowX: true }],
    name: "allows X when option enabled",
  },

  // With specific filename
  {
    code: `console.log('test');`,
    filename: "test.spec.ts",
    name: "allows in test files",
  },

  // With language options override
  {
    code: `<Component />`,
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    name: "handles JSX",
  },
],
```

## Invalid Test Cases

### Basic Error

```typescript
{
  code: `const bad = 1;`,
  errors: [{ messageId: "forbidden" }],
  name: "detects forbidden pattern",
},
```

### With Fix Output

```typescript
{
  code: `const bad = 1;`,
  output: `const good = 1;`,
  errors: [{ messageId: "forbidden" }],
  name: "fixes forbidden pattern",
},
```

### With Specific Location

```typescript
{
  code: `const bad = 1;`,
  errors: [
    {
      messageId: "forbidden",
      line: 1,
      column: 7,
      endLine: 1,
      endColumn: 10,
    },
  ],
  name: "reports correct location",
},
```

### With Data Validation

```typescript
{
  code: `const bad = 1;`,
  errors: [
    {
      messageId: "forbidden",
      data: { name: "bad" },
    },
  ],
  name: "includes correct data in message",
},
```

### Multiple Errors

```typescript
{
  code: `const bad1 = 1; const bad2 = 2;`,
  errors: [
    { messageId: "forbidden" },
    { messageId: "forbidden" },
  ],
  name: "detects multiple violations",
},
```

### Assert No Fix

```typescript
{
  code: `const complexBad = 1;`,
  output: null,  // Explicitly assert no fix
  errors: [{ messageId: "tooComplex" }],
  name: "does not fix complex cases",
},
```

## Testing Suggestions

### With Suggestions

```typescript
{
  code: `const problematic = 1;`,
  errors: [
    {
      messageId: "hasOptions",
      suggestions: [
        {
          messageId: "option1",
          output: `const fixed1 = 1;`,
        },
        {
          messageId: "option2",
          data: { newName: "fixed2" },
          output: `const fixed2 = 1;`,
        },
      ],
    },
  ],
  name: "provides multiple suggestions",
},
```

### Assert No Suggestions

```typescript
{
  code: `const edge = 1;`,
  errors: [
    {
      messageId: "noSuggestions",
      suggestions: null,
    },
  ],
  name: "does not suggest for edge case",
},
```

## Required Test Categories

Every rule SHOULD have tests covering:

| Category | Purpose | Example |
|----------|---------|---------|
| Main case | Core transformation | Primary before/after |
| No-op | Unrelated code passes | Files without pattern |
| Idempotency | Fix is stable | Already-fixed code |
| Edge cases | Variations from spec | Destructuring, aliases |
| Options | Different configs | With/without flags |

## Test Organization

```typescript
ruleTester.run("rule-name", rule, {
  valid: [
    // --- Basic valid cases ---
    `const x = 1;`,

    // --- Already correct ---
    {
      code: `const correct = 1;`,
      name: "ignores already-correct code",
    },

    // --- Exempt patterns ---
    {
      code: `console.log('debug');`,
      filename: "test.spec.ts",
      name: "allows in test files",
    },
  ],

  invalid: [
    // --- Main transformation ---
    {
      code: `const bad = 1;`,
      output: `const good = 1;`,
      errors: [{ messageId: "errorId" }],
      name: "main case",
    },

    // --- Edge cases ---
    {
      code: `const { bad } = obj;`,
      errors: [{ messageId: "errorId" }],
      name: "handles destructuring",
    },

    // --- With options ---
    {
      code: `const bad = 1;`,
      options: [{ strict: true }],
      errors: [{ messageId: "strictError" }],
      name: "strict mode error",
    },
  ],
});
```

## Running Tests

```bash
# Bun
bun test src/rules/__tests__/rule-name.test.ts
bun test --watch src/rules/__tests__/rule-name.test.ts

# Vitest
npx vitest run src/rules/__tests__/rule-name.test.ts
npx vitest src/rules/__tests__/rule-name.test.ts  # watch mode

# Jest
npx jest src/rules/__tests__/rule-name.test.ts
npx jest --watch src/rules/__tests__/rule-name.test.ts
```
