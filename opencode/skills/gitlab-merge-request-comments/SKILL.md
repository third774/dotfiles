---
name: gitlab-merge-request-comments
description: Prepare, validate, and post GitLab merge-request inline or top-level discussions from JSON. Use when creating GitLab review comments, checking diff anchors, or posting MR feedback.
---

# GitLab Discussions

Use this skill for GitLab merge-request discussions. It supports explicit inline and top-level comments. It never uses `glab mr note`.

## Roles

- Sub-agents prepare findings and JSON payloads only. They must not post, resolve, or otherwise mutate a merge request.
- The orchestrator reviews payloads, runs validation, and is the only agent that can post them.

## Payload

Write the payload outside the repository, for example `/tmp/mr-123-comments.json`.

```json
{
  "projectId": 1558,
  "mergeRequestIid": 123,
  "comments": [
    {
      "type": "inline",
      "api": {
        "body": "Agent-assisted comment: Impact: strict peer validation rejects this dependency set. Evidence: the dependency peer range excludes React 19. Requested resolution: upgrade or replace the dependency before publishing React 19 support.",
        "position": {
          "base_sha": "1111111111111111111111111111111111111111",
          "start_sha": "2222222222222222222222222222222222222222",
          "head_sha": "3333333333333333333333333333333333333333",
          "new_path": "src/example/package.json",
          "new_line": 23
        }
      }
    },
    {
      "type": "top-level",
      "api": {
        "body": "Agent-assisted comment: Impact: this finding applies across several files. Evidence: the review identifies each affected path. Requested resolution: address the shared issue before merge."
      }
    }
  ]
}
```

Every comment requires `type`. The allowed values are `inline` and `top-level`.

- `inline` requires a new-side position with current `base_sha`, `start_sha`, `head_sha`, `new_path`, and `new_line`. Do not supply old-side fields.
- `top-level` accepts only `api.body` and has no position.
- Every body starts exactly with `Agent-assisted comment:`.

## Validate

Run this command from the target GitLab repository before any post. `glab` selects its authenticated host from the current repository. The command reads the JSON file, validates its schema, confirms the target MR exists, and verifies every inline anchor against the current MR version and raw diff.

```sh
node "$HOME/.config/opencode/skills/gitlab-merge-request-comments/scripts/gitlab-discussions.mjs" --file /tmp/mr-123-comments.json
```

Validation does not create discussions.

## Post

Only the orchestrator can post. First review every payload for a valid relevant anchor and concise impact, evidence, and requested resolution.

```sh
node "$HOME/.config/opencode/skills/gitlab-merge-request-comments/scripts/gitlab-discussions.mjs" --file /tmp/mr-123-comments.json --post
```

Posting rereads and validates the exact JSON file. It also revalidates every comment immediately before its POST. A stale inline position stops the command before GitLab receives that post.

Posts use `glab api .../discussions` with multipart form fields. Inline responses must be `DiffNote`s with matching non-null new-side positions. Top-level responses must not be `DiffNote`s and must not have a position. If a response does not match its requested type, the script deletes the created note when possible and stops. It never changes an inline request into a top-level request, or the reverse. After every comment posts successfully, it deletes the JSON payload. If posting fails, it keeps the payload for recovery.

## Review Rules

- Anchor a finding to a changed new line whenever possible.
- If the issue has no changed code line, use the most relevant changed file and line.
- Return no inline payload when there is no valid relevant diff anchor.
- Check existing discussions before proposing a finding. Do not duplicate resolved or existing feedback.
- Match the claim to its evidence. Distinguish runtime failures, peer/installability defects, and test-coverage regressions.
