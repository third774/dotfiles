# Example Skill Patterns

These patterns are derived from well-crafted skills. Use them as templates when creating new skills.

## Pattern 1: Simple Instruction Skill

For skills that provide guidelines and checklists without requiring reference files.

**When to use:** Single-purpose skills under ~150 lines with no domain-specific variations.

**Example:** `verification-before-completion`

```yaml
---
name: verification-before-completion
description: Run verification commands before claiming work is complete or fixed. Use before asserting any task is done, bug is fixed, tests pass, or feature works.
---

# Verification Before Completion

**Core Principle:** No completion claims without fresh verification evidence.

## The Verification Gate

BEFORE any claim of success, completion, or satisfaction:

Copy this checklist and track your progress:

```
Verification Checklist:
- [ ] IDENTIFY: What command proves this claim?
- [ ] RUN: Execute the verification command (fresh, complete)
- [ ] READ: Check full output, exit code, failure counts
- [ ] VERIFY: Does output confirm the claim?
```

## When This Applies

ALWAYS before:

- Claiming "tests pass", "build succeeds", "linter clean", "bug fixed"
- Expressing satisfaction ("Great!", "Done!", "Perfect!")
- Using qualifiers ("should work", "probably fixed", "seems to")

## Common Verification Requirements

| Claim | Required Evidence | Not Sufficient |
|-------|-------------------|----------------|
| Tests pass | `yarn test` output: 0 failures | Previous run |
| Build succeeds | Build command: exit 0 | Linter clean |
| Bug fixed | Test reproducing bug: now passes | Code changed |

## No Exceptions

Run the command. Read the output. THEN claim the result.
```

**Key characteristics:**
- Frontmatter description includes both what (run verification) and when (before claiming completion)
- Single checklist for the core workflow
- Table for quick reference
- No reference files needed - everything fits in one focused document

---

## Pattern 2: Skill with Language/Domain References

For skills where core principles are universal but implementation varies by context.

**When to use:** Skills that apply across multiple languages, frameworks, or domains where details differ significantly.

**Example:** `writing-tests`

**Main SKILL.md structure:**

```yaml
---
name: writing-tests
description: Write behavior-focused tests following Testing Trophy model with real dependencies, avoiding common anti-patterns like testing mocks and polluting production code
---

# Writing Tests

**Core Philosophy:** Test user-observable behavior with real dependencies.

<IMPORTANT>
1. Test real behavior, not mock behavior
2. Never add test-only methods to production code
3. Never mock without understanding dependencies
</IMPORTANT>

## Testing Trophy Model

Write tests in this priority order:

1. **Integration Tests (PRIMARY)** - Multiple units with real dependencies
2. **E2E Tests (SECONDARY)** - Complete workflows across the stack
3. **Unit Tests (RARE)** - Pure functions only (no dependencies)

## Pre-Test Workflow

Copy this checklist and track your progress:

```
Test Writing Progress:
- [ ] Step 1: Review project standards
- [ ] Step 2: Understand behavior
- [ ] Step 3: Choose test type
- [ ] Step 4: Identify dependencies
- [ ] Step 5: Write failing test first
- [ ] Step 6: Implement minimal code to pass
- [ ] Step 7: Verify coverage
```

## Test Type Decision

```
Is this a complete user workflow?
  → YES: E2E test

Is this a pure function (no side effects)?
  → YES: Unit test

Everything else:
  → Integration test
```

## Mocking Guidelines

**Default: Don't mock. Use real dependencies.**

### Only Mock These
- External HTTP/API calls
- Time-dependent operations
- Third-party services

### Never Mock These
- Internal modules/packages
- Database queries (use test database)
- Your own code calling your own code

## Language-Specific Patterns

For detailed framework patterns:

- **JavaScript/React**: See `references/javascript-react.md`
- **Python**: See `references/python.md`
- **Go**: See `references/go.md`

## Anti-Patterns to Avoid

### Testing Mock Behavior

```
// BAD: Testing that the mock was called
mock_service.assert_called_once()

// GOOD: Test the actual outcome
assert user.is_active == True
```

<IMPORTANT>
**Remember:** Behavior over implementation. Real over mocked.
</IMPORTANT>
```

**Reference file structure:** `references/javascript-react.md`

```markdown
# JavaScript/React Testing Patterns

## React Testing Library

### Query Priority

1. `getByRole` - Accessible queries first
2. `getByLabelText` - Form inputs
3. `getByText` - Non-interactive elements
4. `getByTestId` - Last resort only

### Component Test Pattern

```typescript
describe("ComponentName", () => {
  it("should render expected content", () => {
    render(<Component {...props} />)
    expect(screen.getByRole("button")).toHaveTextContent("Submit")
  })
})
```

## Jest/Vitest Setup

[Framework-specific details...]
```

**Key characteristics:**
- Core principles in main file apply universally
- `<IMPORTANT>` tags mark iron laws
- Decision tree helps choose approach
- Reference files contain implementation details that vary by context
- Main file stays focused (~300 lines), details pushed to references

---

## Pattern 3: Skill with Supporting Resources

For skills that need reference materials like color palettes, examples, or templates.

**When to use:** Skills where the "how" requires detailed examples or resources that would bloat the main file.

**Example:** `visualizing-with-mermaid`

**Main SKILL.md structure:**

```yaml
---
name: visualizing-with-mermaid
description: Create professional Mermaid diagrams with proper styling and visual hierarchy. Use when creating flowcharts, sequence diagrams, state machines, class diagrams, or architecture visualizations.
---

# Visualizing with Mermaid

You are a technical visualization expert. Your job is creating diagrams that communicate clearly, not just technically correct boxes and arrows.

## Default Styling Mode

**Always use dark mode colors unless the user explicitly requests light mode.**

## Core Principles

### 1. Visual Hierarchy Over Decoration
Use color, size, and styling to guide the eye to what matters most.

### 2. Semantic Color, Not Random Color
Colors should have meaning - grouping, state, critical paths.

### 3. Simplicity Over Completeness
80% of the system clearly is better than 100% confusingly.

## Choosing the Right Diagram Type

### Flowchart
**Use for**: Process flows, decision trees, algorithm logic
**Avoid for**: Simple linear flows, complex state machines

### Sequence Diagram
**Use for**: Time-based interactions, API calls, message passing
**Avoid for**: Static relationships, complex branching

[Additional diagram types...]

## Styling Guidelines

### Color Palette

**Default: Use dark mode colors.** See `references/color-palettes.md` for the complete styleguide.

### Styling Best Practices

**Do:**
- Use fills to group related components
- Add stroke width to highlight critical paths
- Keep line colors consistent

**Don't:**
- Use pure black (#000000)
- Use more than 5 colors per diagram
- Mix warm and cool colors randomly

## Common Patterns and Examples

For detailed pattern examples including:
- Three-tier architecture
- Request flows with error handling
- State machines with semantic colors

See `references/examples.md` for complete code examples.

## Workflow

1. **Understand the Purpose** - What decision should this enable?
2. **Choose Diagram Type** - Based on what you're showing
3. **Sketch Structure** - Components, relationships, groupings
4. **Apply Semantic Styling** - Colors with meaning
5. **Review** - Can someone understand it in 10 seconds?

<IMPORTANT>
A diagram should make something easier to understand. If it doesn't, it needs better design.
</IMPORTANT>
```

**Reference file:** `references/color-palettes.md`

```markdown
# Color Palettes

## Dark Mode (Default)

### Primary Colors
| Purpose | Hex | Usage |
|---------|-----|-------|
| Background | #1a1a2e | Subgraph backgrounds |
| Primary | #4a9eff | Main flow elements |
| Success | #4ade80 | Completed states |
| Warning | #fbbf24 | Caution points |
| Error | #f87171 | Error states |

### Usage Example
```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart LR
    A[Start]:::primary --> B[Process]:::default
    style A fill:#4a9eff,color:#fff
```

## Light Mode

[Light mode palette...]
```

**Key characteristics:**
- Main file covers concepts, workflow, and decision-making
- Reference files contain specific resources (palettes, examples)
- Clear defaults stated ("always use dark mode unless...")
- Workflow section guides the process
- References are for "what exactly" not "what to do"

---

## Pattern 4: Phased Investigation Skill

For skills that guide systematic approaches to complex problems.

**When to use:** Debugging, analysis, or investigation tasks that require a structured methodology.

**Example:** `systematic-debugging`

**Main SKILL.md structure:**

```yaml
---
name: systematic-debugging
description: Four-phase debugging framework with root cause tracing - understand the source before proposing fixes. Use when investigating bugs, errors, unexpected behavior, or failed tests.
---

# Systematic Debugging

**Core Principle:** Understand the root cause before proposing fixes.

## The Four Phases

Copy this checklist when starting a debugging session:

```
Debugging Progress:
- [ ] Phase 1: OBSERVE - Gather evidence without assumptions
- [ ] Phase 2: HYPOTHESIZE - Form testable theories
- [ ] Phase 3: ISOLATE - Narrow down the cause
- [ ] Phase 4: VERIFY - Confirm fix addresses root cause
```

## Phase 1: Observe

**Goal:** Gather evidence without making assumptions.

1. Reproduce the bug reliably
2. Document exact error messages
3. Note the expected vs actual behavior
4. Identify when it started (recent changes?)
5. Check if it's consistent or intermittent

**Output:** Clear problem statement with reproduction steps.

## Phase 2: Hypothesize

**Goal:** Form testable theories about the cause.

1. List possible causes (don't filter yet)
2. Rank by likelihood based on evidence
3. Identify what would prove/disprove each

**Output:** Ranked list of hypotheses with test criteria.

## Phase 3: Isolate

**Goal:** Narrow down to the specific cause.

1. Test hypotheses systematically (most likely first)
2. Use binary search to narrow scope
3. Add logging/breakpoints strategically
4. Check boundaries and edge cases

See `references/debugging-techniques.md` for specific isolation strategies.

**Output:** Identified root cause with evidence.

## Phase 4: Verify

**Goal:** Confirm the fix addresses the root cause.

1. Implement minimal fix
2. Verify original bug is resolved
3. Check for regressions
4. Document the fix and why it works

**Output:** Working fix with explanation.

## Red Flags

Stop and reassess if:

- Fixing one thing breaks another
- The fix "works" but you don't know why
- You're guessing rather than testing
- Time spent exceeds bug severity

<IMPORTANT>
Never propose a fix without understanding why it works. "It seems to fix it" is not sufficient.
</IMPORTANT>
```

**Key characteristics:**
- Clear phases with defined goals and outputs
- Checklist at the start for tracking progress
- Each phase builds on the previous
- Reference file for detailed techniques (not required to complete main workflow)
- Red flags section helps identify when to pivot
- Iron law prevents premature "fixes"

---

## Choosing Your Pattern

| Pattern | Use When | Examples |
|---------|----------|----------|
| Simple Instruction | Single purpose, <150 lines, no variations | verification, code comments |
| Language/Domain References | Core principles + context-specific details | testing, linting |
| Supporting Resources | Need palettes, templates, extensive examples | visualization, documentation |
| Phased Investigation | Systematic methodology for complex problems | debugging, analysis |

Most skills fit one of these patterns. Start with the simplest pattern that meets your needs.
