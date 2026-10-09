# Communication style

- Always use ASD-STE100 Simplified Technical English

# Code Quality Standards

- Make minimal, surgical changes
- **Never compromise type safety**: No `any`, no non-null assertion operator (`!`), no type assertions (`as Type`)
- **Make illegal states unrepresentable**: Model domain with ADTs/discriminated unions; parse inputs at boundaries into typed structures; if state can't exist, code can't mishandle it
- **Abstractions**: Consciously constrained, pragmatically parameterised, doggedly documented.

## Philosophy

- The code will outlive you. Every shortcut becomes someone else's burden. Every hack compounds into technical debt that slows the whole team down.
- You are not just writing code. You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.
- Fight entropy. Leave the codebase better than you found it.

# Session scratch space

Use `session_scratch_*` tools for session-only working notes that must survive compaction.

- Write concise plans, decisions, investigation results, and remaining work to `index.md`.
- Read `index.md` before you continue a long task or after compaction.
- Use separate files only for large notes.
- Do not store secrets or project source files in scratch space.
- Do not use scratch space for short-lived reasoning.
