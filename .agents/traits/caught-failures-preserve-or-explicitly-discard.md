---
name: caught-failures-preserve-or-explicitly-discard
subject: Caught, rejected, or handled failures in application code
requirement: When code translates an existing failure into a domain error, it
  must forward that exact failure as the domain error's `cause`. The domain
  error's type or schema must permit its `cause` field. Code may deliberately
  discard a caught or rejected failure when it establishes an expected
  control-flow result instead of reporting a domain error.
applicability: Applies to TypeScript and JavaScript try/catch blocks, promise
  rejection handlers, Effect error handlers and mappings, and error-boundary
  translation. It does not require a `cause` for a new local validation, state,
  or business-rule failure with no prior failure to forward. A deliberately
  discarded failure should be clear from the surrounding control flow; document
  the reason when it is not clear.
purpose: Preserve diagnostic context whenever a failure is reported, while
  allowing normal control flow to test operations that can fail.
guidance: Pass the caught or mapped value directly as `cause`; do not retain
  only its message or construct a replacement error. Examples of intentional
  discard include attempting an operation only to determine whether an input is
  valid, then returning a boolean or other expected result.
---
