---
description: Run 3 parallel code reviews, then synthesize findings
subagent: false
---

**Raw arguments:** $ARGUMENTS

**Instructions:**

Coordinate the review in the current session. Start all reviewer and validation subagents directly from this session. Each subagent must do its own work without starting other subagents.

Review only. Do not modify repository files or run commands that change repository state. Give the same restriction to every reviewer and validator.

## Process

1. **Select the target and fetch the diff:**
   - Preserve the exact raw arguments above, even when empty. Parse the target and focus areas from those arguments, not from a rewritten summary.
   - Explicit targets take priority:
     - Commit or range mentioned → `git diff <range>` or `git show <commit>`.
     - Files/paths mentioned → `git diff HEAD --no-color -- <paths>`.
     - For other targets, select the scope requested by the user.
   - When no target is specified:
     - Check `git status --short` for staged, unstaged, and untracked changes.
     - If changes exist, review uncommitted changes with `git diff HEAD --no-color`. Include relevant untracked file contents without staging them.
     - If the working tree is clean and the current branch is not the repository's configured primary branch, review `git diff --no-color <primary>...HEAD` (changes since their merge base).
     - Determine the primary branch from repository configuration, such as the remote's HEAD. Do not assume `main` or `master`. If the primary branch or comparison base cannot be determined, ask the user instead of guessing.
     - If the working tree is clean and the primary branch is checked out, report that there are no changes to review and stop.
   - If the selected diff is empty and there are no relevant untracked files, report that there are no changes in the selected target and stop.
   - Leave surrounding-code discovery to the reviewers.
2. **State the interpretation:** Before starting reviewers, output:
   - `Reviewing: [target]`, including the comparison base for a branch review.
   - `Focus: [areas]` when focus areas were provided.
3. **Start three parallel review calls:** Call `review-opus`, `review-gemini`, and `review-codex` directly. Give each:
   - `Original /review arguments:` followed by the exact preserved arguments, even when empty.
   - The same selected target, comparison base, diff, and relevant untracked file contents.
   - The parsed focus areas, if provided.
   - Instructions to explore callers, importers, types, tests, and adjacent code independently.
   - Instructions to work read-only, start no other subagents, and state if the review could not be completed.
4. **Wait for all three review calls:**
   - Track each reviewer as completed, failed, or incomplete. A failed call, empty response, or partial review is not a completed review.
   - Record the exact available error or stated reason for failures and incomplete reviews. Do not infer a cause that was not reported.
   - Continue with completed reviews when possible. If none completed, report an incomplete review with the available errors and stop.
5. **Combine findings:**
   - Merge duplicate issues and group them by severity: Must Fix, Should Fix, Consider, Divergent Findings.
   - Record reviewer agreement counts and disagreements from completed reviews only.
   - Use the higher severity when reviewers disagree.
   - Drop Consider issues raised by only one reviewer.
   - Keep Done Well observations separate; they do not need issue validation.
6. **Validate issues:**
   - For each remaining issue, start a parallel call to `general` directly from the current session.
   - Give each validator the file:line reference, issue description, full reviewer rationale, and source files to read.
   - Instruct it to work read-only, start no other subagents, and check the issue against the source and relevant context.
   - Request one result with supporting evidence: `VALID` (the issue exists), `INVALID` (the issue is a false positive), or `UNVERIFIED` (it could not determine whether the issue exists).
   - Wait for all validation calls. Treat failed calls, missing results, and uncertain results as UNVERIFIED, not INVALID. Preserve available errors or stated reasons.
7. **Report results:**
   - Include only VALID issues in the findings sections. List UNVERIFIED issues separately with the reason they could not be checked. Omit INVALID issues.
   - Mark the review complete only if all three reviewers completed and every required validation returned VALID or INVALID.
   - Otherwise, mark it incomplete, identify the failed or incomplete steps, and report the available errors or reasons.
   - Report no findings only when the review is complete and no validated issues remain. A failed or incomplete review is not a clean result.

## Output format

Keep the report concise. Omit empty findings sections.

```markdown
## Review Status
[Complete or Incomplete. State the target and comparison base, each reviewer's status, and validation status. Include available errors or reasons for incomplete work.]

## User-Requested Focus
[Findings related to the requested concerns. Omit if no focus was provided.]

## Must Fix
[Validated blocking issues found by 2+ reviewers. Include file:line, issue, impact, and reviewer agreement.]

## Should Fix
[Validated non-blocking issues with 2+ reviewer agreement.]

## Consider
[At most 2 validated items, each raised by multiple reviewers.]

## Divergent Findings
[Validated issues raised by only one reviewer. Include severity and reviewer name for human judgment.]

## Unverified Issues
[Issues whose validation was incomplete. Include file:line and the available error or reason. Do not present these as confirmed findings.]

## Done Well
[Brief positive observations from completed reviews.]
```
