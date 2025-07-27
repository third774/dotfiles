---
allowed-tools: Bash(git status:*), Bash(git diff:*)
description: Review staged changes for possible issues
---

## Context

- Current git status: !`git status`
- Staged changes: !`git diff --cached`
- Current branch: !`git branch --show-current`

## Your task

Review the staged changes above and identify possible issues including:

- Code quality problems (complexity, readability, maintainability)
- Potential bugs or logic errors
- Security vulnerabilities or concerns
- Performance issues
- Type safety issues (especially important for TypeScript)
- Missing error handling
- Inconsistent patterns or style violations
- Breaking changes or backward compatibility issues
- Missing tests for new functionality
- Documentation gaps

Provide specific feedback with file and line references where applicable. Focus on actionable improvements.

Additional context or specific areas to focus on: {args}
