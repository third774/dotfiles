---
name: effect-helpers-do-not-throw
subject: Helper functions used by Effect code
requirement: Helper functions used by Effect code must represent expected
  failures in their return type and must not throw exceptions.
applicability: Applies to project-owned helper functions called from Effect
  workflows. It does not prohibit throwing at a framework boundary when that
  boundary requires it.
purpose: Effect workflows must state expected failure modes in their types so
  callers can handle them with confidence.
guidance: Return an Effect with a typed error, or parse and validate inputs at
  the boundary before calling the helper. Capture exceptional third-party
  boundaries directly where needed instead of hiding a throwing helper behind
  Effect.tryPromise.
---
Avoid helper functions that can throw and are later passed to Effect.tryPromise or another catch-all wrapper. The helper signature should make expected failures visible.