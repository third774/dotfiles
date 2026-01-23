# Agents

Specialized AI assistants with custom prompts, models, and tool access.

## Types

| Type | Description | Switch |
|------|-------------|--------|
| **Primary** | Main agents you interact with directly | `Tab` key cycles |
| **Subagent** | Invoked by primary agents or via `@mention` | `@agent-name` in prompt |

## Built-in Agents

| Agent | Mode | Description |
|-------|------|-------------|
| `build` | primary | Default agent, all tools enabled |
| `plan` | primary | Analysis mode, file edits require approval |
| `general` | subagent | Multi-step tasks, full tool access |
| `explore` | subagent | Fast read-only codebase exploration |

## Define via Markdown

Place in `~/.config/opencode/agents/` (global) or `.opencode/agents/` (project).

Filename becomes agent name (e.g., `review.md` creates `review` agent).

```markdown
---
description: Reviews code for best practices
mode: subagent
model: anthropic/claude-sonnet-4-5
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
permission:
  edit: deny
---

You are a code reviewer. Focus on:
- Security vulnerabilities
- Performance issues
- Maintainability
```

## Define via JSON

```jsonc
{
  "agent": {
    "code-reviewer": {
      "description": "Reviews code for best practices",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-5",
      "prompt": "You are a code reviewer...",
      "tools": {
        "write": false,
        "edit": false
      }
    }
  }
}
```

## Options

| Option | Type | Description |
|--------|------|-------------|
| `description` | string | **Required.** What the agent does |
| `mode` | `"primary"`/`"subagent"`/`"all"` | How agent can be used (default: `"all"`) |
| `model` | string | Override model (`provider/model-id`) |
| `prompt` | string | System prompt (or `{file:./prompt.txt}`) |
| `temperature` | number | 0.0-1.0 (lower = more deterministic) |
| `maxSteps` | number | Max agentic iterations before forced response |
| `tools` | object | Enable/disable tools (`true`/`false`) |
| `permission` | object | Tool permissions (`"allow"`/`"ask"`/`"deny"`) |
| `hidden` | boolean | Hide from `@` autocomplete (subagents only) |
| `disable` | boolean | Disable the agent |

## Tool Control

```jsonc
{
  "agent": {
    "readonly": {
      "tools": {
        "write": false,
        "edit": false,
        "bash": false,
        "mymcp_*": false  // Glob pattern
      }
    }
  }
}
```

## Task Permissions

Control which subagents an agent can invoke:

```jsonc
{
  "agent": {
    "orchestrator": {
      "permission": {
        "task": {
          "*": "deny",
          "helper-*": "allow",
          "expensive-agent": "ask"
        }
      }
    }
  }
}
```

Last matching rule wins.

## Bash Permissions per Agent

```jsonc
{
  "agent": {
    "safe-agent": {
      "permission": {
        "bash": {
          "*": "ask",
          "git status*": "allow",
          "git log*": "allow"
        }
      }
    }
  }
}
```

## Additional Provider Options

Pass provider-specific options directly:

```jsonc
{
  "agent": {
    "deep-thinker": {
      "model": "openai/gpt-5",
      "reasoningEffort": "high"  // Passed to provider
    }
  }
}
```

## Create Interactively

```bash
opencode agent create
```

Prompts for location, description, tools, and generates the agent file.
