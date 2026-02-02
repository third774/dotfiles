---
description: Run 3 parallel code reviews on uncommitted changes, then synthesize findings
---

Review the current uncommitted changes (staged + unstaged).

**Focus areas:** $ARGUMENTS

**Instructions:**

Spawn a single Task call to the `review-orchestrator` subagent, passing:
- The focus areas (if any were specified)

The orchestrator fetches the diff, spawns 3 parallel reviewers, and synthesizes results. Report its findings directly to the user.
