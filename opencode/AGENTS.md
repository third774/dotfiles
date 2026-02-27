# General

You run in an environment where ast-grep (`sg`) is available; whenever a search requires syntax-aware or structural matching, default to `sg --lang <lang> -p '<pattern>'` (infer the language from context) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.

# Code Quality Standards

- Make minimal, surgical changes
- **Never compromise type safety**: No `any`, no non-null assertion operator (`!`), no type assertions (`as Type`)
- **Make illegal states unrepresentable**: Model domain with ADTs/discriminated unions; parse inputs at boundaries into typed structures; if state can't exist, code can't mishandle it
- **Abstractions**: Consciously constrained, pragmatically parameterised, doggedly documented.

## Philosophy

- The code will outlive you. Every shortcut becomes someone else's burden. Every hack compounds into technical debt that slows the whole team down.
- You are not just writing code. You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.
- Fight entropy. Leave the codebase better than you found it.
