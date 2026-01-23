# Permissions

Control what tools can do without approval.

## Permission Levels

| Level | Behavior |
|-------|----------|
| `"allow"` | Run immediately, no approval |
| `"ask"` | Prompt user for approval |
| `"deny"` | Block entirely |

## Global Permissions

```jsonc
{
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "webfetch": "allow"
  }
}
```

## Tool Permissions

| Tool | Controls |
|------|----------|
| `edit` | `edit`, `write`, `patch`, `multiedit` (all file modifications) |
| `bash` | Shell command execution |
| `webfetch` | Fetching web content |
| `skill` | Loading skills |
| `read` | Reading files |
| `grep` | Searching file contents |
| `glob` | Finding files by pattern |

## Wildcard Patterns

```jsonc
{
  "permission": {
    "mymcp_*": "ask"  // All tools from mymcp server
  }
}
```

## Bash Command Permissions

Fine-grained control over specific commands:

```jsonc
{
  "permission": {
    "bash": {
      "*": "ask",              // Default: ask for all
      "git status*": "allow",  // Allow git status
      "git log*": "allow",     // Allow git log
      "git push*": "ask",      // Ask for push
      "rm -rf*": "deny"        // Block dangerous commands
    }
  }
}
```

**Rules evaluated in order; last match wins.**

## Per-Agent Permissions

Override global permissions for specific agents:

```jsonc
{
  "permission": {
    "edit": "deny"
  },
  "agent": {
    "build": {
      "permission": {
        "edit": "ask"
      }
    }
  }
}
```

### In Markdown Agents

```markdown
---
description: Safe exploration agent
mode: subagent
permission:
  edit: deny
  bash:
    "*": ask
    "git diff": allow
    "git log*": allow
  webfetch: deny
---
```

## Skill Permissions

Control which skills agents can load:

```jsonc
{
  "permission": {
    "skill": {
      "*": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

Per-agent skill permissions:

```jsonc
{
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "internal-*": "allow"
        }
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

When `deny`, the subagent is removed from Task tool description entirely.

## Default Behavior

By default, OpenCode **allows all operations** without approval. Configure permissions to add restrictions.

## Practical Examples

### Read-only Agent

```jsonc
{
  "agent": {
    "reviewer": {
      "permission": {
        "edit": "deny",
        "bash": {
          "*": "deny",
          "git diff*": "allow",
          "git log*": "allow",
          "git show*": "allow"
        }
      }
    }
  }
}
```

### Safe Defaults with Exceptions

```jsonc
{
  "permission": {
    "bash": {
      "*": "ask",
      "ls *": "allow",
      "cat *": "allow",
      "git status*": "allow",
      "git log*": "allow",
      "git diff*": "allow"
    }
  }
}
```

### MCP Tool Restrictions

```jsonc
{
  "permission": {
    "expensive-mcp_*": "ask",
    "dangerous-mcp_*": "deny"
  }
}
```
