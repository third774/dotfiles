---
name: effect-errors-translated-by-tag
subject: Effect code that translates the failures of an effect into a different error
requirement: The code must name each error tag that it translates, with
  `Effect.catchTag`, `Effect.catchTags`, or a handler that narrows by tag (such
  as `Effect.catchIf` with a tag refinement or `Effect.catchReason`). It must
  not use `Effect.mapError`, `Effect.catch`, or another handler that maps every
  failure in the error channel to one error. Failures that the code does not
  name must propagate unchanged.
applicability: "Exception: a designated catch-all boundary whose purpose is to
  turn every failure that earlier code did not translate into a generic
  fallback, for example a top-level HTTP error handler that renders any
  remaining failure as a 500 response and reports it."
purpose: A broad mapping silently reclassifies any failure type that a
  dependency adds later (for example, a storage outage reported as a 400 bad
  request), and the type checker does not show the change. When the code names
  tags, a new failure propagates to the catch-all boundary, where it is logged
  and reported, and it appears in the error type of the effect.
guidance: Use one handler for each tag, and share a helper when several tags map
  the same way. Name the tag also when the source fails with only one tag today;
  for example, Effect Schema decoding fails with `SchemaError`.
---
```diff
-const input = yield* decodeInput(raw).pipe(Effect.mapError((cause) => new BadRequest({ cause })));
+const input = yield* decodeInput(raw).pipe(
+  Effect.catchTag('SchemaError', (cause) => Effect.fail(new BadRequest({ cause }))),
+);
```