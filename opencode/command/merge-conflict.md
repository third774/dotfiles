---
description: Help resolve merge conflicts safely
---

**Input:** $ARGUMENTS

Help me resolve the current Git merge conflict. Resolve only conflicts that are simple and straightforward. If a conflict needs product intent, domain judgment, or a choice between competing behavior, stop and ask me a specific question before editing that part.

Workflow:

1. Confirm the repository is actually in a conflicted state.

- Run `git status --porcelain`.
- Run `git diff --name-only --diff-filter=U`.
- If there are no unmerged files, report that there is no active merge conflict and stop.

2. Inspect only conflicted files first.

- Read the conflict markers and nearby context.
- Understand both sides before editing.
- For each file, identify whether the conflict is mechanical or semantic.

3. Resolve mechanical conflicts directly.

- Safe examples: duplicate imports, adjacent non-overlapping additions, simple formatting conflicts, repeated config entries, obviously identical code moved nearby.
- Preserve both sides when they are compatible.
- Keep the smallest correct change.

4. Ask before resolving semantic conflicts.

- Ask me for help if the conflict involves competing business logic, changed function signatures, deleted-vs-modified files, test expectation disagreements, data migrations, generated files with unclear source of truth, or anything where either side could plausibly be correct.
- Do not guess. Ask a concise question that names the file, summarizes both options, and explains the decision needed.

5. Avoid destructive Git operations.

- Do not run `git merge --abort`, `git rebase --abort`, `git reset`, or checkout entire files with `--ours` / `--theirs` unless I explicitly ask.
- Do not stage or commit unless I explicitly ask.
- Do not overwrite unrelated user changes.

6. Verify after edits.

- Run `git diff --check`.
- Run focused tests, lint, typecheck, or build commands when they are discoverable and reasonably scoped.
- Re-run `git diff --name-only --diff-filter=U` to confirm whether conflicts remain.

Final response:

- List files resolved.
- List files still needing my decision, with exact questions.
- Summarize verification commands and results.
- If conflicts remain, say so clearly and do not claim the merge is complete.
