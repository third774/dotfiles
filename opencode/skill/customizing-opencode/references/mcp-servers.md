# MCP Servers

Add external tools via Model Context Protocol.

## Local Server

Starts a local process:

```jsonc
{
  "mcp": {
    "my-server": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-command"],
      "enabled": true,
      "environment": {
        "API_KEY": "{env:MY_API_KEY}"
      },
      "timeout": 5000
    }
  }
}
```

| Option | Type | Description |
|--------|------|-------------|
| `type` | `"local"` | Required |
| `command` | string[] | Command and arguments |
| `environment` | object | Environment variables |
| `enabled` | boolean | Enable on startup |
| `timeout` | number | Tool fetch timeout (ms, default 5000) |

## Remote Server

Connects to HTTP endpoint:

```jsonc
{
  "mcp": {
    "my-remote": {
      "type": "remote",
      "url": "https://mcp.example.com",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer {env:API_KEY}"
      }
    }
  }
}
```

| Option | Type | Description |
|--------|------|-------------|
| `type` | `"remote"` | Required |
| `url` | string | Server URL |
| `headers` | object | Request headers |
| `oauth` | object/false | OAuth config or `false` to disable |
| `enabled` | boolean | Enable on startup |
| `timeout` | number | Tool fetch timeout (ms) |

## OAuth

Auto-detected for most servers. Pre-registered credentials:

```jsonc
{
  "mcp": {
    "my-oauth-server": {
      "type": "remote",
      "url": "https://mcp.example.com",
      "oauth": {
        "clientId": "{env:CLIENT_ID}",
        "clientSecret": "{env:CLIENT_SECRET}",
        "scope": "tools:read tools:execute"
      }
    }
  }
}
```

### OAuth CLI

```bash
opencode mcp auth my-server    # Authenticate
opencode mcp list              # List servers + auth status
opencode mcp logout my-server  # Remove credentials
opencode mcp debug my-server   # Debug connection
```

## Enable/Disable

```jsonc
{
  "mcp": {
    "my-server": {
      "type": "local",
      "command": ["..."],
      "enabled": false  // Disabled but configured
    }
  }
}
```

Override remote defaults by setting `enabled: true` locally.

## Global Tool Control

Disable MCP tools globally:

```jsonc
{
  "tools": {
    "my-mcp*": false  // Glob pattern
  }
}
```

## Per-Agent Control

Enable MCP only for specific agents:

```jsonc
{
  "tools": {
    "expensive-mcp*": false
  },
  "agent": {
    "specialist": {
      "tools": {
        "expensive-mcp*": true
      }
    }
  }
}
```

## Tool Naming

MCP tools are prefixed with server name: `myserver_toolname`

Glob patterns: `myserver_*` matches all tools from `myserver`.

## Examples

### Context7 (docs search)

```jsonc
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

### Sentry

```jsonc
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "oauth": {}
    }
  }
}
```

### Chrome DevTools

```jsonc
{
  "mcp": {
    "chrome-devtools": {
      "type": "local",
      "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

## Prompting

Reference MCP by name: `use the context7 tool to search docs`
