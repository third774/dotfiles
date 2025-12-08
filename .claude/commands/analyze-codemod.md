---
argument-hint: [directory] [codemod-path]
description: Apply a codemod to files and validate results, reporting any issues
---

# Analyze Codemod Application

Apply and validate the codemod at `$2` against all JavaScript/TypeScript files in `$1`.

## Task

1. Use Glob to find all `.js`, `.jsx`, `.ts`, `.tsx` files recursively in `$1`
2. For each file found, spawn a `general-purpose` subagent using the Task tool. Run ALL subagents in parallel (single message with multiple Task tool calls).

## Subagent Instructions

Each subagent must perform these steps for its assigned file:

### Step 1: Capture Original
Read the file and store its complete contents as "BEFORE".

### Step 2: Apply Codemod
Run: `npx jscodeshift -t $2 <file>`

### Step 3: Capture Result
Read the file again and store its complete contents as "AFTER".

### Step 4: Validate Transformation
Run these checks:
- `npx prettier --check <file>` - must pass without errors
- `npx eslint <file>` - must have no errors
- `tsc --noEmit --skipLibCheck <file>` - must type-check successfully

### Step 5: Analyze for Logic Errors
Compare BEFORE and AFTER. Look for any obvious bugs or incorrect transformations introduced by the codemod.

### Step 6: Report (only if issues found)
If ANY validation fails OR the transformation appears buggy, write a report file named `<original-filename>.codemod-report.md` in the same directory as the source file.

If all checks pass and the transformation looks correct, take no action (silent success).

## Report Format

The report must follow this structure:

```
# Codemod Report: <filename>

## Codemod Applied
Path: <codemod-path>

## Input (Before)
```tsx
<complete original file contents>
```

## Output (After)
```tsx
<complete transformed file contents>
```

## Issues Found

### <Issue Type>
<Detailed description of the problem>

### Validation Output
```
<error messages from prettier/eslint/tsc>
```

## Suggested Fix
<If the fix is obvious, provide it here. If not, write: "This issue requires developer clarification. Please review the transformation and provide guidance on the expected behavior.">
```

The report will be used by another agent to fix the codemod, so include enough context for that purpose.
