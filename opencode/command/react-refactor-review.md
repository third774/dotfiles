---
description: Review React refactoring changes for behavior preservation, prop interfaces, and idiomatic patterns
allowed-tools: Bash(git:*), Read, Grep, Glob
---

# React Refactoring Code Review

Review the current git diff for React refactoring quality. This review focuses on ensuring refactoring preserves behavior while improving code structure.

**Related Skill:** For deeper adversarial analysis (security, edge cases, unintended consequences), invoke `adversarial-code-review` skill after this review.

## Context

**Raw arguments:** $ARGUMENTS

Parse arguments:
- If `--staged` is provided, review only staged changes
- If a file path is provided, focus review on that file
- Otherwise, review all uncommitted changes

**Diff to review:**

```
!`git diff --no-color $ARGUMENTS 2>/dev/null || git diff --staged --no-color`
```

## Review Checklist

Analyze the diff against each of the following criteria. For each item, provide:
- **Status**: Pass / Concern / Fail
- **Details**: Specific observations with line references
- **Suggestions**: Concrete improvements if applicable

### 1. Behavior Preservation

**The Iron Law of Refactoring: behavior must not change.**

Look for:
- Functions that now return different values or types
- Side effects that were added, removed, or reordered
- Error handling that changed (thrown errors, error messages)
- Default values that changed
- Conditional logic that evaluates differently
- API contracts that shifted (required vs optional, types)

**Key question:** Could any consumer of this code observe different behavior?

### 2. Prop Interface Changes

Examine all component prop changes:
- Props that were added, removed, or renamed
- Props where types changed (especially widening or narrowing)
- Props where default values changed
- Props that became required or optional
- Callback prop signatures that changed
- Children prop handling changes

**Key question:** Are all prop interface changes intentional and documented?

### 3. Call Site Completeness

For every prop interface change, verify:
- All usages of modified components are visible in the diff
- New required props are provided at all call sites
- Removed props are cleaned up from all call sites
- Type changes are compatible with all existing usages

**Key question:** If a component's props changed, were ALL consumers updated?

### 4. Rules of Hooks Compliance

Verify React hooks rules are followed:
- Hooks are called at top level (not inside conditions, loops, or nested functions)
- Hooks are called in the same order on every render
- Custom hooks follow the `use` naming convention
- Hook dependencies are correctly specified
- No hooks called conditionally or in callbacks

**Specific patterns to flag:**
```typescript
// BAD: Conditional hook
if (condition) {
  const [state, setState] = useState();  // Violation!
}

// BAD: Hook in callback
const handleClick = () => {
  const data = useSomething();  // Violation!
};

// BAD: Hook in loop
items.map(item => {
  const [state] = useState(item);  // Violation!
});
```

### 5. Idiomatic React Patterns

Check for React best practices:

**Component Structure:**
- Hooks at the top, in consistent order (state, context, custom, effects)
- Derived state using `useMemo` where appropriate
- Event handlers using `useCallback` when passed to children
- Effects with proper cleanup functions
- Clear separation between logic and render

**State Management:**
- Minimal state (compute what you can)
- No state synchronization anti-patterns (`useEffect` to sync state)
- Appropriate state colocation
- Immutable state updates

**Type Safety:**
- Strong prop types (no `any`)
- Proper generic usage for reusable components
- Event handler types are specific (not `any` or untyped)

### 6. Complexity Assessment

Evaluate if the refactoring reduces or increases complexity:

- Are there more or fewer lines of code?
- Are there more or fewer indentation levels?
- Is the cognitive load reduced or increased?
- Are abstractions pulling their weight?
- Could this be simpler?

**Warning signs:**
- Premature abstraction (abstractions with only one use)
- Over-engineering (complex patterns for simple problems)
- "Clever" code that's hard to follow
- Abstractions that leak implementation details

### 7. Diff Readability

Consider if the diff could be easier to review:

- Could large changes be split into smaller, focused commits?
- Are mechanical changes (renames, moves) mixed with logic changes?
- Would extracting a helper first make the main change clearer?
- Are unrelated changes bundled together?

**Suggestions for cleaner diffs:**
- Separate rename/move commits from logic changes
- One refactoring pattern per commit
- Mechanical changes in bulk (e.g., all prop renames first)

## Output Format

Provide your review in this structure:

```markdown
## React Refactoring Review

### Summary
[1-2 sentence overall assessment]

### What's Done Well
[At least one specific positive observation]

### Checklist Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| Behavior Preservation | Pass/Concern/Fail | [Brief note] |
| Prop Interface Changes | Pass/Concern/Fail | [Brief note] |
| Call Site Completeness | Pass/Concern/Fail | [Brief note] |
| Rules of Hooks | Pass/Concern/Fail | [Brief note] |
| Idiomatic React | Pass/Concern/Fail | [Brief note] |
| Complexity | Pass/Concern/Fail | [Brief note] |
| Diff Readability | Pass/Concern/Fail | [Brief note] |

### Blocking Issues

[Issues that MUST be fixed before merge. For each:]

#### [Issue Title]
**Location:** `file.tsx:45-52`
**Criterion:** [Which checklist item]
**Issue:** [Clear description]
**Impact:** [What breaks if not fixed]
**Suggestion:** [How to fix]

[Or "None" if no blocking issues]

### Should Fix

[Issues that should be addressed but don't block merge]

### Consider

[Max 2 items - style/optimization suggestions only]
```

## Impact Filter

Before reporting a finding, it must score 2+ on:

```
□ Likely to occur (probability)
□ Impactful if it occurs (severity)
□ Non-obvious to the author (added value)
```

If a finding scores 0-1, don't report it—you're adding noise, not value.

## Severity Classification

Classify each finding appropriately:

| Severity | Definition | Action |
|----------|------------|--------|
| **Blocking** | Breaks behavior, correctness, or types | Must fix before merge |
| **Should Fix** | Likely problems but not immediately broken | Fix before or soon after |
| **Consider** | Style, optimization, theoretical | Max 2 per review |

## Adversarial Lenses (Optional Deep Dive)

For changes touching user input, state management, or API boundaries, consider applying these adversarial perspectives from the `adversarial-code-review` skill:

| Lens | Core Question | React-Specific Concerns |
|------|---------------|------------------------|
| **Careless Colleague** | "How would this break if used wrong?" | Prop misuse, missing required props, wrong types |
| **Future Maintainer** | "What will confuse me in 6 months?" | Implicit state dependencies, magic values |
| **Data Integrity** | "What happens to state?" | Race conditions in async state updates, stale closures |
| **Interaction Effects** | "What does this change elsewhere?" | Context consumers, parent re-renders, memo invalidation |

## Guidelines

- Be specific: reference file names and line numbers
- Be constructive: offer solutions, not just criticisms
- Be pragmatic: distinguish blocking issues from nice-to-haves
- Trust the author's intent: assume changes are intentional unless evidence suggests otherwise
- Acknowledge something done well—adversarial doesn't mean hostile
- If context is insufficient to evaluate a criterion, say so and explain what additional information would help
