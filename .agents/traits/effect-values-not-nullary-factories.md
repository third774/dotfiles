---
name: effect-values-not-nullary-factories
subject: Effect operations with no construction-time inputs
requirement: Represent an operation as an Effect value, not a zero-argument
  function that only constructs and returns that Effect.
applicability: Applies when no separate construction-time behavior is required.
  Functions required by an external callback API are excluded.
purpose: Keep operations lazy and composable without unnecessary wrapper functions.
guidance: Put work that must happen on each execution inside Effect.sync,
  Effect.suspend, or another suitable Effect constructor.
---
