---
allowed-tools: Bash(git status:*), Bash(git diff:*)
description: Review code changes using the code-reviewer agent
---

## Context

- Current git status: !`git status --short`
- Files with changes: !`git diff --name-only HEAD`

## Your task

Review all code changes in this session using the **code-reviewer** agent.

### Steps

1. Identify all modified files from the git status/diff above
2. Use the `code-reviewer` agent to perform a comprehensive review
3. Present the review findings to the user

### What to Review

The code-reviewer agent will check:
- **Security**: Injection vulnerabilities, hardcoded secrets, input validation
- **Performance**: N+1 queries, memory leaks, inefficient patterns
- **Style**: Naming conventions, code duplication, complexity
- **Maintainability**: Error handling, type safety, best practices

### Instructions

Invoke the code-reviewer agent now with the list of changed files. Pass the file paths and ask for a comprehensive review.
