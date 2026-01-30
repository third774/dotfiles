---
description: Run 3 parallel code reviews on uncommitted changes, then synthesize findings
---

Review the current uncommitted changes (staged + unstaged).

**Diff to review:**

```
!`git diff HEAD --no-color`
```

**Additional focus areas:** $ARGUMENTS

**Instructions:**

1. Spawn 3 parallel Task calls to the `review` subagent, passing:
   - The full diff above
   - The additional focus areas (if any were specified)
2. Wait for all 3 to complete
3. Synthesize results into unified findings:
   - **User-Requested Focus**: Findings related to specified concerns (if any)
   - **Consensus issues**: Found by 2+ reviewers (high confidence)
   - **Divergent findings**: Found by only 1 reviewer (flag for human judgment)
   - **Unanimous positives**: What all reviewers agreed was done well
   - Dedupe equivalent findings, note when reviewers disagreed on severity
