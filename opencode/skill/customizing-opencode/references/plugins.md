# Plugins

Extend OpenCode with custom hooks and integrations.

## Loading Plugins

### Local Files

Place TypeScript/JavaScript in:
- `~/.config/opencode/plugins/` (global)
- `.opencode/plugins/` (project)

### NPM Packages

```jsonc
{
  "plugin": [
    "opencode-helicone-session",
    "@my-org/custom-plugin"
  ]
}
```

Packages auto-installed via Bun at startup.

## Load Order

1. Global config plugins
2. Project config plugins
3. Global plugin directory
4. Project plugin directory

## Plugin Structure

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const MyPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  // Initialization code
  
  return {
    // Hook implementations
  }
}
```

### Context Object

| Property | Description |
|----------|-------------|
| `project` | Current project info |
| `directory` | Current working directory |
| `worktree` | Git worktree path |
| `client` | OpenCode SDK client |
| `$` | Bun shell API |

## Event Hooks

Subscribe to events by returning handlers:

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        // Session completed
      }
    }
  }
}
```

### Event Types

**Session**: `session.created`, `session.updated`, `session.deleted`, `session.idle`, `session.error`, `session.compacted`, `session.status`, `session.diff`

**Message**: `message.updated`, `message.removed`, `message.part.updated`, `message.part.removed`

**Tool**: `tool.execute.before`, `tool.execute.after`

**File**: `file.edited`, `file.watcher.updated`

**Permission**: `permission.updated`, `permission.replied`

**Other**: `command.executed`, `todo.updated`, `lsp.updated`, `lsp.client.diagnostics`, `server.connected`, `installation.updated`

**TUI**: `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`

## Tool Hooks

Intercept tool execution:

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "read" && output.args.filePath.includes(".env")) {
        throw new Error("Cannot read .env files")
      }
    },
    "tool.execute.after": async (input, output) => {
      // Process tool result
    }
  }
}
```

## Custom Tools via Plugin

```typescript
import { type Plugin, tool } from "@opencode-ai/plugin"

export const MyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      mytool: tool({
        description: "My custom tool",
        args: {
          input: tool.schema.string()
        },
        async execute(args, ctx) {
          return `Processed: ${args.input}`
        }
      })
    }
  }
}
```

## Compaction Hook

Customize context during compaction:

```typescript
export const MyPlugin: Plugin = async (ctx) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      // Add context
      output.context.push("## Important State\n- Current task: ...")
      
      // Or replace entire prompt
      output.prompt = "Custom compaction instructions..."
    }
  }
}
```

## Dependencies

For local plugins needing npm packages, create `.opencode/package.json`:

```json
{
  "dependencies": {
    "shescape": "^2.1.0"
  }
}
```

OpenCode runs `bun install` at startup.

## Logging

Use structured logging instead of `console.log`:

```typescript
await client.app.log({
  service: "my-plugin",
  level: "info",  // debug, info, warn, error
  message: "Plugin initialized",
  extra: { foo: "bar" }
})
```

## Example: Notifications

```typescript
export const NotificationPlugin: Plugin = async ({ $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await $`osascript -e 'display notification "Done!" with title "OpenCode"'`
      }
    }
  }
}
```
