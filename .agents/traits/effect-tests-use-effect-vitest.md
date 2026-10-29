---
name: effect-tests-use-effect-vitest
subject: Tests of Effect-based workflows
requirement: Write tests as Effects and run them with the test helpers from
  @effect/vitest, such as it.effect, it.scoped, or it.live. Do not use ordinary
  Vitest async test callbacks or manually run Effects with Effect.runPromise
  inside tests. Convert promise-only boundary calls into Effects.
applicability: "Applies to tests of Effect-based workflows, including tests that
  call promise-based Worker or framework boundaries. Pure synchronous tests with
  no Effect workflow are excluded. fast-check property tests are excluded: they
  may use ordinary Vitest test callbacks and run the Effect under test with
  Effect.runPromise inside a fast-check property."
purpose: Let the test runner manage Effect execution, test services, and
  resource cleanup.
guidance: Use it.live when a test needs the live clock. Use Effect.tryPromise
  when promise rejection must enter the typed error channel.
---
fast-check property tests are excluded because @effect/vitest's `it.effect.prop` accepts only Effect Schema or Effect Arbitrary inputs, not fast-check arbitraries, so a fast-check property has to run the Effect under test itself.
