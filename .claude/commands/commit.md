---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your task

Based on the above changes, create a single git commit using conventional commit format.

### Conventional Commit Format

- Use format: `<type>(<scope>): <subject>`
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Scope is optional but recommended (e.g., component name, module)
- Subject should be imperative, present tense ("change" not "changed")
- Examples:
  - `feat(auth): add OAuth2 integration`
  - `fix: resolve memory leak in data processing`
  - `docs(readme): update installation instructions`
