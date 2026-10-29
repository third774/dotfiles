---
name: effect-sensitive-values-redacted
subject: Code that reads, holds, passes, or emits a credential or a direct
  personal identifier. A credential is any value that grants access or proves
  identity, such as a token, password, JWT assertion, cookie, or private key. A
  direct personal identifier is a value that, on its own, tells a reader which
  person it belongs to, such as an email address, a personal name, the username
  of a person, a phone number, a postal address, a government ID number, or the
  client IP address of a person's request.
requirement: "Wrap the value in Effect `Redacted` where it enters the program
  (with `Config.Redacted`, `Schema.RedactedFromValue`, `Schema.Redacted`, or
  `Redacted.make`), and keep it `Redacted` in variables, parameters, return
  values, struct and schema fields, service shapes, and errors. Call
  `Redacted.value` only in the expression that uses or discloses the value, and
  do not keep or pass on the unwrapped result. A credential may be unwrapped
  only to use it, for example in an outbound authorization header or a signature
  check; it must never be written to any log, audit record, trace, error, or
  Sentry event. A direct personal identifier may be unwrapped only for these
  disclosures: a storage write, an audit record, a field that a protocol
  requires, output to a caller or operator who is authorized to see it, and one
  field per request log that identifies the authenticated actor. It must never
  be written to error messages, error causes, traces, Sentry events, or other
  log fields."
applicability: Applies only to code in workspace packages that depend on
  `effect`; packages without that dependency are exempt. Values that identify a
  person only when combined with other data are not direct personal
  identifiers, for example user agents, timestamps, request IDs, opaque internal
  IDs, package names, and team names. Identifiers of non-human actors, such as
  service-token client IDs, bot user IDs, and team IDs, are not direct personal
  identifiers unless they contain a person's name or email address; they are
  sensitive only when they are also credentials. Test code, including fixtures
  and test helpers, may keep personal identifiers and synthetic credentials,
  such as literals and tokens from mock issuers, as plain values, but the code
  under test must receive and return `Redacted` values. Real credentials in test
  code, such as a token read from an environment variable, must stay
  `Redacted`. Generated files and storage table definitions describe external
  representations and are exempt; decode their values into `Redacted` at the
  storage boundary.
purpose: Logs, traces, and error reports have wider access, longer retention,
  and third-party processors such as Sentry, so they are where credentials and
  personal data leak. `Redacted` prints as `<redacted>` in `String`, JSON, and
  inspection, so an accidental leak discloses nothing. Each intended disclosure
  becomes an explicit `Redacted.value` call that a reviewer can find and justify
  against a short list of approved destinations. The rule keeps accountability,
  because audit records and the request log's actor field still record who
  acted, and it does not treat every value associated with a person as
  sensitive.
guidance: "To decide whether a value is a direct personal identifier, ask
  whether a reader of a log line that contains only this value could name the
  person. Give each `Redacted` a `label` that names its kind, such as `{ label:
  'email' }`. Compare `Redacted` values with `Equal.equals` or
  `Redacted.makeEquivalence` instead of unwrapping both sides. To fix an
  existing plain value, change its type to `Redacted` at the source, let the
  type checker find each use, and add `Redacted.value` only at the approved
  destinations."
---
Credential entering through config and used only in an outbound header:

```diff
-const token = yield* Config.string('NPM_TOKEN');
-const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
+const token = yield* Config.Redacted('NPM_TOKEN');
+const response = await fetch(url, { headers: { authorization: `Bearer ${Redacted.value(token)}` } });
```

Email decoded at a boundary, kept out of an error message, and unwrapped for the actor field and the audit record:

```diff
-const claims = Schema.Struct({ email: Schema.String });
-if (!allowed) return yield* new Forbidden({ message: `${claims.email} may not publish` });
-log.set({ user: { id: claims.email, kind: 'human' } });
-auditLog.record({ actorId: claims.email });
+const claims = Schema.Struct({ email: Schema.RedactedFromValue(Schema.String, { label: 'email' }) });
+if (!allowed) return yield* new Forbidden({ message: 'You may not publish this package' });
+log.set({ user: { id: Redacted.value(claims.email), kind: 'human' } });
+auditLog.record({ actorId: Redacted.value(claims.email) });
```
