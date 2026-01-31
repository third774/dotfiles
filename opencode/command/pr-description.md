---
description: Generate a PR description from context and branch changes, copy to clipboard
allowed-tools: Bash(git:*), Bash(pbcopy:*), Bash(osascript:*)
---

# Generate PR Description

Generate a markdown PR description based on the current conversation context and any committed changes on the current branch.

## Argument Parsing

**Raw arguments:** $ARGUMENTS

Parse the arguments to extract an optional base branch:

- If arguments start with `--base <branch>`, use `<branch>` as the base branch and treat the remainder as the developer's intent
- Otherwise, auto-detect the base branch and treat the full arguments as the developer's intent

**Auto-detected default base:** !`git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"`

Based on parsing above, determine:

- **Base branch:** (use `--base` value if provided, otherwise use auto-detected default)
- **Developer's intent:** (remainder after `--base <branch>` extraction, or full arguments if no `--base`)

## Developer's Intent

Use the parsed developer's intent as the primary guide for the "Context" section. The developer has provided a brief, informal description of the motivation. Your job is to:

- Expand on this intent using evidence from the diffs and conversation
- Clean up the language so it reads naturally and professionally
- Connect it to the specific changes visible in the code
- If the intent is already clear and concise, preserve it rather than expanding. Making small edits for grammar/spelling is fine. Avoid over-justification.
- If no intent is provided, infer the "why" from the conversation history and changes.

## Git Context

Using the parsed base branch from above:

- Current branch: !`git branch --show-current`
- Base branch: (use parsed base branch)
- Commits on this branch (not on base): !`git log <base-branch>..HEAD --oneline` (substitute parsed base branch)
- Full diff from base branch: !`git diff <base-branch>...HEAD --stat` (substitute parsed base branch)

## Your Task

1. **Start with the developer's intent** - use the `$ARGUMENTS` as the directional guide for why this change matters
2. **Review the conversation history** to understand what changes were made and gather supporting details
3. **Review the git context above** to capture any committed changes that may not be in the conversation
4. **Generate a PR description** in the following format:

```markdown
# Description

<Summarize WHAT changed - be specific about files, features, or fixes>

# Context

<Explain WHY these changes were made - the motivation, problem being solved, or feature being added>
```

4. **Copy to clipboard** using pbcopy
5. **Announce completion** using: `osascript -e 'say "Pull request description ready"'`

## Guidelines

- Be concise but comprehensive
- Use bullet points for multiple changes
- Include any breaking changes or migration notes if applicable
- Reference any related issues or discussions mentioned in the conversation
- The "Context" section should flow naturally from the developer's intent argument, expanded with specific details from the code changes
