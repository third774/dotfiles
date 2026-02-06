---
description: Run 3 parallel code reviews, then synthesize findings
---

**Input:** $ARGUMENTS

**Instructions:**

Spawn a single Task call to the `review-orchestrator` subagent, passing the full input above.

The orchestrator interprets the target (files, commits, modules, or uncommitted changes by default), spawns 3 parallel reviewers, and synthesizes results. Report its findings directly to the user.
