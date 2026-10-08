---
description: Run 3 parallel code reviews, then synthesize findings
---

**Raw arguments:** $ARGUMENTS

**Instructions:**

Spawn a single Task call to the `review-orchestrator` subagent. The Task prompt must include:

- `Original /review arguments:` followed by the exact raw arguments above, even when empty
- An instruction to preserve those arguments verbatim when spawning reviewer subagents

The orchestrator interprets the target (files, commits, modules, or uncommitted changes by default), spawns 3 parallel reviewers, and synthesizes results. Report its findings directly to the user.
