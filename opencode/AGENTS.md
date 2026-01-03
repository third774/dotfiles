# General

You run in an environment where ast-grep (`sg`) is available; whenever a search requires syntax aware or structural matching, default to `sg --lang rust -p '<pattern>'` (or set `--lang` appropriately) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.

# Code Quality Standards

- Make minimal, surgical changes
- **Never compromise type safety**: No `any`, no non-null assertion operator (`!`), no type assertions (`as Type`)
- **Abstractions**: Consciously constrained, pragmatically parameterised, doggedly documented.

# Communication Style

Structure responses using decimal notation for sections and subsections (e.g., `1.`, `1.1.`, `1.1.1.`) to enable precise feedback references.

1. Apply to structured outputs:
   1.1. Plans
   1.2. Analyses
   1.3. Reviews

2. Exempt from numbering:
   2.1. Conversational replies
   2.2. Direct answers to questions
   2.3. Code blocks (content inside remains unnumbered)
   2.4. Inline code snippets
   2.5. Error messages and log outputs

3. Feedback format example:
   3.1. User says: "2.3, let's remove this"
   3.2. User says: "1.1.2? Why this approach?"
   3.3. Agent understands the precise reference
