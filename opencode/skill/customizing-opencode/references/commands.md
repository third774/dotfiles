# Commands

Custom slash commands for repetitive prompts.

## Define via Markdown

Place in `~/.config/opencode/commands/` (global) or `.opencode/commands/` (project).

Filename becomes command name (e.g., `test.md` creates `/test` command).

```markdown
---
description: Run tests with coverage
agent: build
model: anthropic/claude-sonnet-4-5
---

Run the full test suite with coverage report.
Focus on failing tests and suggest fixes.
```

## Define via JSON

```jsonc
{
  "command": {
    "test": {
      "template": "Run the full test suite with coverage.\nFocus on failing tests.",
      "description": "Run tests with coverage",
      "agent": "build",
      "model": "anthropic/claude-sonnet-4-5"
    }
  }
}
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `template` | string | **Required (JSON).** The prompt text |
| `description` | string | Shown in TUI autocomplete |
| `agent` | string | Agent to execute command |
| `model` | string | Override model for this command |
| `subtask` | boolean | Force subagent invocation |

## Template Syntax

### Arguments

`$ARGUMENTS` - All arguments passed to the command.

```markdown
Create a React component named $ARGUMENTS with TypeScript.
```

```
/component Button
```

### Positional Arguments

`$1`, `$2`, `$3`, etc.

```markdown
Create file $1 in directory $2 with content: $3
```

```
/create-file config.json src "{ \"key\": \"value\" }"
```

### Shell Output

`` !`command` `` - Inject command output into prompt.

```markdown
Here are the test results:
!`npm test`

Analyze failures and suggest fixes.
```

```markdown
Recent commits:
!`git log --oneline -10`

Review these changes.
```

### File References

`@filepath` - Include file contents.

```markdown
Review the component in @src/components/Button.tsx.
Check for performance issues.
```

## Usage

```
/test
/component MyButton
/review @src/utils.ts
```

## Built-in Commands

Custom commands can override built-ins: `/init`, `/undo`, `/redo`, `/share`, `/help`, `/theme`, `/connect`
