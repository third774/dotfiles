---
description: Diagnose why a GitLab merge request is failing
---

Use the `glab` CLI to diagnose why my MR is failing.

Workflow (run in this order):

1. Identify current branch and MR

- `git branch --show-current`
- `glab mr list --source-branch "<branch>" --output json`
- Pick the open MR and extract: `iid`, `project_id`, `web_url`.

2. Inspect MR pipelines

- `glab api "projects/<project_id>/merge_requests/<iid>/pipelines"`
- Choose the latest `merge_request_event` pipeline.
- Report: pipeline `id`, `status`, `web_url`.

3. Find failed jobs in that pipeline

- `glab api "projects/<project_id>/pipelines/<pipeline_id>/jobs?per_page=200"`
- Filter jobs where `status=="failed"` and report:
  `id`, `name`, `stage`, `failure_reason`, `web_url`.

4. Pull logs for each failed job

- `glab ci trace <job_id>`
- Extract the concrete failing error, including file path + line number when present.

Output format:

- MR URL
- Latest failing pipeline URL + status
- Failed jobs list
- Root cause section:
  - Primary blocker (merge-gating failure)
  - Secondary/non-blocking failures
  - Exact evidence lines (error text, file path, line)
- Keep it concise and actionable.
