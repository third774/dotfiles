---
name: effect-failures-not-sentinel-values
subject: Failure branches in project-owned functions used by Effect code that
  report the failure through their return value
requirement: A function used by Effect code must not report a detected failure
  (an exceeded limit, malformed input, or invalid state) as a sentinel return
  value such as `null`, `undefined`, `false`, or a flag on returned state. It
  must be an Effect that fails with a tagged error for that case.
applicability: Applies only to failures reported through return values. A
  legitimately absent result that is not a failure (for example, an archive with
  no README or a missing optional field) may still be `null` or `Option.none()`.
  Whether a function throws is out of scope; that is covered by
  `effect-helpers-do-not-throw`.
purpose: A failure returned as the same value as a valid empty result hides its
  cause from callers and logs; a tagged error keeps the two distinguishable.
guidance: Write the function as `Effect.fn(function* (...) { ... })`, fail with
  `return yield* new SomeError(...)`, and use effectful combinators such as
  `Stream.mapAccumEffect` at call sites.
---
```diff
-if (size === null) {
-  scan.result = null;
-  break;
-}
+if (size === null) {
+  return yield* new ParserError({ reason: 'invalid', message: 'The package archive has a malformed entry size.' });
+}
```