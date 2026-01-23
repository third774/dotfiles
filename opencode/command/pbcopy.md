---
description: Copy content to clipboard
allowed-tools: Bash(pbcopy:*)
---

Copy content to the clipboard using pbcopy.

**Instruction:** $ARGUMENTS

## Behavior

- If instruction provided: Follow it to determine what content from this conversation should be copied
- If no instruction: Copy your last response (before this command was invoked) verbatim

Pipe the content to `pbcopy`.
