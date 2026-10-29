---
name: tests-detect-broken-behavior
subject: Tests of project-owned behavior
requirement: Test observable behavior against independently specified expected
  results or invariants. Each test must fail for a relevant defect in the
  behavior it claims to verify. Checking only the test setup, or repeating the
  implementation to compute the expected result, is not sufficient.
applicability: Includes pure-function tests, schema tests, and integration
  tests. Round-trip and property-based tests are valid when they check a
  meaningful invariant.
purpose: Make tests detect defects rather than give false confidence.
guidance: Ask which plausible incorrect implementation would make the test fail.
  Use independent expected values, boundary cases, or behavioral invariants to
  distinguish it from correct behavior.
---
