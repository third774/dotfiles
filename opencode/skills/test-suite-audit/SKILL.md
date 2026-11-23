---
name: test-suite-audit
description: Audit a test suite for tests that lie — tautological tests, structure-sensitive tests, and mocks that don't match reality — and report each one with evidence and a fix.
metadata:
  opencode/autoinvoke: false
---

# Test suite audit

A green suite is not proof that the code works. Find the tests that **lie**: tests that pass while the behavior they claim to check is broken, or fail while it is fine. This is an audit. Report findings; change no test until the user picks which findings to fix.

## The three lies

1. **Tautological** — the test only restates the implementation. It asserts a constant's value (`expect(POST_CHARACTER_LIMIT).toBe(280)`), computes its expected result with the code under test, or checks only its own setup. No plausible bug in the behavior makes it fail.
2. **Structure-sensitive** — the test depends on how the code is written, not on what it does. It reads source files, asserts on the order or names of things in the source, imports internals that the module's public interface does not export, or asserts on calls between the module's own parts. A refactor that keeps the behavior makes it fail.
3. **Mocks that don't match reality** — a stub, fake, or mock drops the rules of the real dependency that the code relies on: validation, errors, limits, ordering, state, or response shape. The test cannot fail in the ways production fails. Example: a stubbed `AudioContext` that ignores the browser's rules about when it can start.

For each candidate, ask the **mutation question**: which plausible broken implementation would still pass, or which behavior-preserving refactor would make it fail? A finding without an answer to this question is not a finding.

## Steps

1. **Map the suite.** Read the project's testing guidance (`AGENTS.md`, test helpers, fixtures, `.agents/traits/` test traits) and list every test file. Done when every test file is in a list grouped by package or area.
2. **Sweep for signals.** Search for the cheap signals of each lie: `readFileSync`/`readFile` on source paths, assertions on exported constants, `vi.mock`/`jest.mock`, `vi.fn`/`vi.spyOn`, hand-built stubs and fakes, `toHaveBeenCalled*` assertions, and imports from `internal/` or private paths. Signals point to candidates; they are not findings.
3. **Read every test in scope.** For a large suite, split the file list across subagents, one area each, and give each one this skill's "three lies" section and the mutation question. For each mock or fake, read the real dependency's contract (its docs, types, or source) and list the rules that the double drops. Done when every file in the map is marked as read, with its findings or "clean".
4. **Report.** Group findings by lie, worst first. For each finding give:
   - the file and line, and the test name
   - the lie, and the answer to the mutation question
   - the fix: the behavior to assert instead, the public interface to test through, or the real implementation or more faithful fake to use
   - whether to delete the test (when it checks nothing that another test does not already check)
   End with counts per lie and the areas that are clean. Offer to turn a repeated finding into a lint rule or a trait.
