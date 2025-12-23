---
description: Fix a codemod using TDD based on a failing transformation and issue description
---

# Fix Codemod

Fix the codemod at `$1` based on the issue observed when transforming `$2`.

## Description of what went wrong with the transformation

$3

## Context

This codemod is part of a **React Router v5 to v6 migration** using the `react-router-dom-v5-compat` compatibility layer.

### Key Migration Resources

- **Primary migration guide**: https://reactrouter.com/6.30.2/upgrading/v5
- **Community discussion**: https://github.com/remix-run/react-router/discussions/8753
- **React Router v5 docs**: https://v5.reactrouter.com/

### Key API Changes (v5 → v6)

- `useHistory()` → `useNavigate()` (returns function, not object)
- `<Switch>` → `<Routes>`
- `<Route component={X}>` → `<Route element={<X />}>`
- `<Redirect>` → `<Navigate>`
- `history.push(path)` → `navigate(path)`
- `history.replace(path)` → `navigate(path, { replace: true })`
- `history.go(n)` / `history.goBack()` / `history.goForward()` → `navigate(n)` / `navigate(-1)` / `navigate(1)`
- `match.params` → `useParams()` hook
- `useRouteMatch()` → `useMatch()`
- `matchPath(pathname, options)` → `matchPath(options, pathname)` (argument order swapped)

## Task

Follow the TDD approach: **modify tests first**, then fix the implementation.

### Phase 1: Understand the Problem

1. **Read the codemod** at `$1` to understand what transformations it performs
2. **Read the test file** at `codemods/__tests__/<codemod-name>.test.ts`
3. **Read the source file** at `$2` that had the issue

If the issue description mentions specific code patterns, search the file for those patterns.

### Phase 2: Research the Correct Behavior

Use WebSearch and WebFetch to verify the correct React Router v6 API usage:

1. Search for documentation on any hooks/components mentioned in the issue
2. Verify the correct migration pattern from v5 to v6
3. Confirm what the correct output should be

**Do not assume you know the API**. Always verify against current documentation.

### Phase 3: Create Failing Test (TDD Step 1)

1. Extract the minimal problematic code pattern from `$2`
2. Determine what the **correct** transformed output should be (based on your research)
3. Add a new test case to the test file that:
   - Uses `defineInlineTest` with the input pattern
   - Specifies the expected correct output
   - Has a descriptive test name explaining the scenario

Format the test for readability:

```typescript
defineInlineTest(
  { default: transform, parser: "tsx" },
  {},
  // ─── INPUT ───────────────────────────────────────────────
  `
<input code here>
  `.trim(),
  // ─── OUTPUT ──────────────────────────────────────────────
  `
<expected output here>
  `.trim(),
  "descriptive test name for this scenario",
);
```

### Phase 4: Verify Test Fails

Run the test to confirm it fails:

```bash
npx jest codemods/__tests__/<test-file>.test.ts -t '<test-name>'
```

If the test passes, the issue may be different than described. Re-analyze.

### Phase 5: Fix the Codemod (TDD Step 2)

1. Analyze why the codemod produces incorrect output
2. Modify the codemod implementation to handle the case correctly
3. Ensure changes don't break existing tests

Common issues to check:

- Missing edge case handling
- Incorrect AST node type checks
- Wrong property access patterns
- Missing variable tracking
- Incorrect import handling

### Phase 6: Verify All Tests Pass

Run the full test suite:

```bash
npx jest codemods/__tests__/<test-file>.test.ts
```

All tests must pass, including:

- The new test you added
- All existing tests (no regressions)

### Phase 7: Validate the Fix

1. Reset the original file: `git checkout -- $2`
2. Re-run the codemod: `npx jscodeshift -t $1 $2 --parser=tsx`
3. Read the transformed file and verify it matches expected output
4. Run validation: `bun tsc --noEmit --skipLibCheck $2`

### Phase 8: Report

Summarize:

1. The issue that was found
2. The test case added (input → output)
3. The fix applied to the codemod
4. Confirmation that all tests pass

## Important Notes

- **TDD is mandatory**: Always write the failing test BEFORE fixing the implementation
- **Preserve existing behavior**: Don't break tests that were passing
- **Keep tests readable**: Tests document the codemod's behavior for humans
- **Verify APIs**: Don't guess at React Router APIs; always check documentation
- **Minimal fixes**: Make the smallest change needed to fix the issue
