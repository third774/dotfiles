---
name: migrating-javascript-to-typescript
description: Migrate JavaScript or JSX files to TypeScript in a project that already supports TypeScript. Use when converting existing JavaScript to TypeScript while preserving runtime behavior.
---

# Migrate JavaScript to TypeScript

Preserve runtime behavior. This is a type migration, not a refactor or a bug fix. Do not change executable logic, even when the existing behavior looks wrong. If a safe migration cannot be demonstrated, stop and report the blocker rather than change behavior to make TypeScript accept the code.

## 1. Establish the baseline

- Identify the requested files and their consumers, entry points, tests, and build paths. Include scripts, configuration, and published package entry points where relevant.
- Check the Git status, including staged changes. Preserve all existing work. Do not include unrelated changes in the migration commit.
- Check how the project builds, runs, and type-checks each file. Inspect applicable TypeScript configs, module resolution, file extensions, bundler or transpiler rules, test discovery, and declaration generation. TypeScript support elsewhere in the project does not prove that these files can safely be renamed.
- Run the relevant tests, builds, and type checks before changing files. Record commands and existing failures. Record the runtime artifacts and observable behavior needed for comparison. Note gaps in coverage.
- Choose a small, coherent batch. If the rename would change file discovery, runtime loading, module format, public paths, or behavior and there is no verified way to preserve them, stop and report it. Do not silently alter configuration or runtime imports to make the migration work.

## 2. Rename and commit only

- Rename `.js` to `.ts` and `.jsx` to `.tsx` as appropriate. Do not change file contents, imports, tests, or configuration in this step.
- Review the staged diff to confirm it contains only the intended exact renames. Commit those renames separately, before adding types. Type errors in this intermediate commit are expected.
- Do not stage pre-existing work, bypass failing hooks, or amend another commit. If an exact rename-only commit cannot be made safely or is not permitted, stop and report why. Do not proceed with the type edits without that commit.

## 3. Add types

- Run the applicable type checks and compare diagnostics with the baseline. Work on migration-related diagnostics, including errors in consumers caused by the migration; leave unrelated baseline failures alone.
- First add accurate types to parameters, using existing types where available. Infer types from the implementation and call sites when possible. Add interfaces, type aliases, type-only imports, annotations, or generics only when needed and supported by evidence. Preserve the range of inputs and outputs the JavaScript actually accepts, including optional values and error paths. Do not invent narrower contracts just to make errors disappear.
- Prefer inference for returns, local variables, and other types that TypeScript can determine correctly. Add annotations only when they improve accuracy or resolve a diagnostic without changing behavior.
- Do not add `any`, type assertions, non-null assertions, or misleading types to silence errors. Do not change expressions, control flow, defaults, validation, imports used at runtime, exports, side effects, or evaluation order. Do not introduce runtime TypeScript constructs such as enums, parameter properties, or namespaces.
- Check the actual toolchain: even erased-looking annotations or type imports can change emitted code or decorator metadata. Keep existing runtime imports and their side effects. If a type-only edit changes runtime output, do not use it.

## 4. Record unresolved diagnostics

- For each migration-related diagnostic that cannot be resolved with an accurate, behavior-preserving type change, use the narrowest possible `// @ts-expect-error` on the preceding line. Include a short reason and the diagnostic code. In JSX or other contexts where that syntax is not valid, use the applicable directive form only if the compiler recognizes it.
- Check that each directive suppresses the intended diagnostic and no unrelated diagnostic on that line. Re-run the relevant type checks to detect unused directives. An expect-error only checks that *some* error exists on the next line; it does not verify the diagnostic code.
- Do not use `@ts-ignore`, `@ts-nocheck`, broad lint disables, weaker compiler settings, or casts as substitutes. If a diagnostic cannot be suppressed precisely, including a parse or file-level error, leave it visible and report it as a blocker.

## 5. Verify and report

- Review the type-edit diff against the rename commit. Confirm that all production changes are type-only or diagnostic comments and that existing executable code and runtime imports are unchanged.
- Compare the actual pre- and post-migration build outputs and runtime paths. Check module resolution, import and export behavior, side effects, initialization order, and generated artifacts. Account for toolchain transformations, comments with runtime or tooling meaning, JSX, decorators, and package entry points. Investigate differences; do not assume type syntax is always erased safely. If equivalence cannot be established, report the limitation and do not claim behavior is preserved.
- Run the same relevant tests, builds, and type checks as the baseline, plus any additional checks needed for the migrated files and their consumers. Compare results with the baseline. Verify generated declarations and public type compatibility where the project publishes them. Tests provide evidence, not a proof that all behavior is unchanged.
- Report the rename commit, files migrated, verification commands and results, pre-existing failures, each remaining suppression and its reason, and any unresolved risks or blockers. Do not claim completion if the rename, build, runtime behavior, or required verification remains unsafe or unverified.
