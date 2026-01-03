# General

You run in an environment where ast-grep (`sg`) is available; whenever a search requires syntax aware or structural matching, default to `sg --lang rust -p '<pattern>'` (or set `--lang` appropriately) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.

## Code Quality Standards

- Make minimal, surgical changes
- **Never compromise type safety**: No `any`, no non-null assertion operator (`!`), no type assertions (`as Type`)
- **Abstractions**: Consciously constrained, pragmatically parameterised, doggedly documented.
