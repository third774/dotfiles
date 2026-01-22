# Config Schema

OpenCode configuration via JSON/JSONC files.

## Format

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5",
  // Comments allowed in .jsonc
}
```

## Locations & Precedence

1. **Remote** `.well-known/opencode` (organizational defaults)
2. **Global** `~/.config/opencode/opencode.json`
3. **Custom** `$OPENCODE_CONFIG` env var path
4. **Project** `./opencode.json` (highest priority)

Configs merge; later sources override conflicting keys only.

## Core Options

| Option | Type | Description |
|--------|------|-------------|
| `theme` | string | Theme name or `"system"` |
| `model` | string | Default model (`provider/model-id`) |
| `small_model` | string | Model for lightweight tasks (title generation) |
| `autoupdate` | boolean/`"notify"` | Auto-download updates |
| `default_agent` | string | Default primary agent (`"build"`, `"plan"`, or custom) |
| `share` | `"manual"`/`"auto"`/`"disabled"` | Conversation sharing mode |

## Provider Config

```jsonc
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}",
        "timeout": 600000,
        "setCacheKey": true
      }
    }
  },
  "disabled_providers": ["openai"],
  "enabled_providers": ["anthropic", "gemini"]
}
```

## Tools

Enable/disable built-in tools globally:

```jsonc
{
  "tools": {
    "write": true,
    "bash": true,
    "webfetch": false
  }
}
```

Built-in tools: `bash`, `edit`, `write`, `read`, `grep`, `glob`, `list`, `patch`, `skill`, `todowrite`, `todoread`, `webfetch`, `question`, `lsp` (experimental)

## Instructions

Load additional rule files:

```jsonc
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md",
    "https://example.com/rules.md"
  ]
}
```

## Compaction

```jsonc
{
  "compaction": {
    "auto": true,   // Auto-compact when context full
    "prune": true   // Remove old tool outputs
  }
}
```

## Watcher

Ignore patterns for file watcher:

```jsonc
{
  "watcher": {
    "ignore": ["node_modules/**", "dist/**"]
  }
}
```

## TUI Options

```jsonc
{
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": { "enabled": true },
    "diff_style": "auto"  // or "stacked"
  }
}
```

## Server Options

For `opencode serve` and `opencode web`:

```jsonc
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
    "cors": ["http://localhost:5173"]
  }
}
```

## Variable Substitution

| Syntax | Description |
|--------|-------------|
| `{env:VAR_NAME}` | Environment variable (empty string if unset) |
| `{file:path}` | File contents (relative to config or absolute) |

```jsonc
{
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{file:~/.secrets/openai-key}"
      }
    }
  }
}
```

## Full Schema

https://opencode.ai/config.json
