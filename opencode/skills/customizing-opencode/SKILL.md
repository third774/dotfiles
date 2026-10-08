---
name: customizing-opencode
description: Configure OpenCode via opencode.json, agents, commands, MCP servers, custom tools, plugins, themes, keybinds, and permissions. Use when setting up or modifying OpenCode configuration.
metadata:
  opencode/autoinvoke: false
---

# Customizing OpenCode

Configure OpenCode behavior through config files, agents, commands, and extensions.

## Config File Locations

| Location | Path | Purpose |
|----------|------|---------|
| Global | `~/.config/opencode/opencode.json(c)` | User-wide server and project settings |
| Project | `./opencode.json(c)` or `.opencode/opencode.json(c)` | Project-specific settings |
| Terminal client | `~/.config/opencode/cli.json` | Theme, keybind, and terminal settings |

OpenCode merges direct project config files from the filesystem root to the
current directory, then `.opencode` config files in the same order. Project
configuration overrides global configuration.

## Quick Reference

| Task | Where | Reference |
|------|-------|-----------|
| Set model or server preferences | `opencode.json(c)` | [config-schema.md](references/config-schema.md) |
| Set theme or keybinds | `cli.json` | [themes.md](references/themes.md), [keybinds.md](references/keybinds.md) |
| Define specialized agents | `.opencode/agents/*.md` or config | [agents.md](references/agents.md) |
| Create slash commands | `.opencode/commands/*.md` or config | [commands.md](references/commands.md) |
| Add external tools via MCP | `opencode.json(c)` `mcp.servers` | [mcp-servers.md](references/mcp-servers.md) |
| Write custom tool functions | A server plugin | [custom-tools.md](references/custom-tools.md) |
| Extend with plugins/hooks | `.opencode/plugins/*.ts` or npm | [plugins.md](references/plugins.md) |
| Control tool access | `opencode.json(c)` `permissions` array | [permissions.md](references/permissions.md) |
| Customize keyboard shortcuts | `cli.json` `keybinds` | [keybinds.md](references/keybinds.md) |
| Change colors/appearance | `cli.json` `theme` or custom JSON | [themes.md](references/themes.md) |

## Directory Structure

```
~/.config/opencode/           # Global config
├── opencode.jsonc
├── AGENTS.md                 # Global rules
├── agents/                   # Global agents
├── commands/                 # Global commands
├── plugins/                  # Global plugins
├── skills/                   # Global skills
└── themes/                   # Global custom themes

.opencode/                    # Project config (same structure)
├── agents/
├── commands/
├── plugins/
├── skills/
└── themes/
```

## When to Use What

| Need | Solution |
|------|----------|
| Change model for all projects | Global `opencode.json(c)` |
| Change terminal theme for all projects | Global `cli.json` |
| Project-specific agent behavior | Project `.opencode/agents/` |
| Reusable prompt templates | Commands (`.opencode/commands/`) |
| External service integration | MCP servers |
| Custom logic the LLM can call | Custom tools |
| React to OpenCode events | Plugins |
| Restrict dangerous operations | Permissions |

## Rules (AGENTS.md)

Project instructions loaded into LLM context:

| File | Scope |
|------|-------|
| `./AGENTS.md` | Project (discovered from current directory to filesystem root) |
| `~/.config/opencode/AGENTS.md` | Global |

The `instructions` config field is accepted but does not currently load files.
Use `AGENTS.md` for instructions.

## Docs

Full documentation: https://opencode.ai/v2/docs/config/
