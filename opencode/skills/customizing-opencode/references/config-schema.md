# Configuration

OpenCode server and project configuration uses JSON or JSONC. This is separate
from terminal-client settings in `cli.json`.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
}
```

Use JSONC for comments and trailing commas.

## Locations and precedence

Global configuration is `~/.config/opencode/opencode.json` or
`~/.config/opencode/opencode.jsonc`.

Project configuration can be either `opencode.json(c)` or
`.opencode/opencode.json(c)`. OpenCode searches from the current directory to
the filesystem root. It merges direct files from the farthest directory to the
closest, then `.opencode` files in the same order. A discovered `.opencode`
file therefore overrides a direct config file at the same or a higher level.

## Common settings

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "shell": "/bin/zsh",
  "model": "anthropic/claude-sonnet-4-5",
  "default_agent": "build",
  "update": "notify",
  "snapshots": true,
  "formatter": true,
  "watcher": {
    "ignore": ["dist/**", "coverage/**"],
  },
  "tool_output": {
    "max_lines": 2000,
    "max_bytes": 51200,
  },
}
```

`update` is global-only and accepts `"disable"`, `"notify"`, or `"auto"`.
It defaults to `"notify"`. `share`, `username`, and `instructions` are accepted,
but they do not currently change session behavior; use `AGENTS.md` for project
instructions.

## Providers, agents, commands, and plugins

Use the V2 plural fields:

```jsonc
{
  "providers": {
    "openai": {
      "models": {
        "team-model": {
          "modelID": "gpt-5.2",
          "name": "Team model",
          "limit": { "context": 200000, "output": 32000 },
        },
      },
    },
  },
  "agents": {},
  "commands": {},
  "plugins": [],
  "permissions": [],
}
```

Use `providers`, not `provider`; `commands`, not `command`; and ordered
`permissions`, not `permission`. See the dedicated references for the shapes
of those fields.

## MCP servers

Put named server definitions under `mcp.servers`:

```jsonc
{
  "mcp": {
    "timeout": { "startup": 45000 },
    "servers": {
      "playwright": {
        "type": "local",
        "command": ["bunx", "@playwright/mcp"],
      },
    },
  },
}
```

See [MCP Servers](./mcp-servers.md) for complete server configuration.

## Compaction and web search

```jsonc
{
  "compaction": {
    "auto": true,
    "keep": { "tokens": 15000 },
    "buffer": 20000,
  },
  "websearch": {
    "provider": "random",
  },
}
```

Set `compaction.auto` to `false` to stop new automatic compaction. Configure
provider-native compaction under the provider or model `settings` object.

## Other configuration

`skills`, `references`, `worktree`, `media`, `warming`, `lsp`, and `formatter`
have dedicated V2 documentation. Use `cli.json` for themes, keybinds, and other
terminal settings; do not put `theme`, `tui`, or keybind settings in
`opencode.json(c)`.

## Variable substitution

Use `{env:NAME}` to load an environment variable. Keep secrets outside config:

```jsonc
{
  "mcp": {
    "servers": {
      "private-api": {
        "type": "remote",
        "url": "https://mcp.example.com/mcp",
        "oauth": false,
        "headers": { "Authorization": "Bearer {env:MCP_API_KEY}" },
      },
    },
  },
}
```
