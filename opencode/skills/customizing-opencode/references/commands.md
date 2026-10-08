# Commands

Custom slash commands expand a prompt template. Put global commands in
`~/.config/opencode/commands/` and project commands in `.opencode/commands/`.
Only Markdown files are discovered. Nested paths become slash-separated command
names. The singular `command/` directories are legacy-compatible; use
`commands/` for new files.

```md
<!-- .opencode/commands/review.md -->
---
description: Review code for correctness
agent: plan
model: anthropic/claude-sonnet-4-5#high
---

Review $ARGUMENTS. Report bugs first.
```

The Markdown body is the template. Do not put `template` in frontmatter.

## JSON configuration

```jsonc
{
  "commands": {
    "review": {
      "description": "Review code for correctness",
      "template": "Review $ARGUMENTS. Report bugs first.",
    },
  },
}
```

| Field | Required | Description |
| --- | --- | --- |
| `template` | JSON only | Prompt template. |
| `description` | No | Text for command lists and discovery. |
| `agent` | No | Agent to select. |
| `model` | No | `provider/model` or `provider/model#variant` override. |
| `subagent` | No | `true` uses a background child session; `false` uses the current session. |
| `subtask` | No | Deprecated alias for `subagent`. |

## Arguments

`$ARGUMENTS` is the complete argument string. `$1`, `$2`, and later positions
are parsed arguments; quotes group words and are removed. The highest-numbered
position receives all remaining text. If a template has no placeholder,
OpenCode appends supplied arguments after a blank line.

```md
Compare $1 with $2.
```

`/compare api "stable branch"` becomes `Compare api with stable branch.`

## Shell blocks

Use `!` followed by backticks to insert shell output. Arguments expand first.

```md
Review this diff:

!`git diff --stat && git diff`
```

Shell blocks run outside the agent tool-permission flow. Do not interpolate
untrusted arguments into them.

Templates do not expand `@path`. Add files through the composer when invoking a
command to attach them.

## Execution and precedence

Commands run in the current session by default. With `subagent: true`, OpenCode
uses a background child session and reports the result to the parent. When it
is omitted, a command selects a child only if its agent has `mode: subagent`.
Command model selection takes precedence over the selected agent's model, which
takes precedence over the current session model.

Markdown and JSON commands share one registry. Later sources replace commands
with the same name. Project definitions override global ones and a custom
command can override a built-in command. Changes reload automatically.
