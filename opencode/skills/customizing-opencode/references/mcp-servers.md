# MCP Servers

Configure Model Context Protocol servers under `mcp.servers`. Use the CLI when
possible because it preserves unrelated configuration:

```sh
opencode mcp add context7 --global --url https://mcp.context7.com/mcp
opencode mcp list
```

Remote servers use OAuth by default. When authentication is required, use
`/mcps` in OpenCode to select the server and sign in.

## Local server

```jsonc
{
  "mcp": {
    "servers": {
      "everything": {
        "type": "local",
        "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
        "cwd": ".",
        "environment": { "MCP_API_KEY": "{env:MCP_API_KEY}" },
      },
    },
  },
}
```

| Field | Description |
| --- | --- |
| `command` | Required executable and arguments. |
| `cwd` | Optional process directory; defaults to the workspace. |
| `environment` | Additional string environment variables. |
| `disabled` | Prevent connection when `true`. |
| `codemode` | Defaults to `true`; set `false` for direct provider tools. |
| `timeout` | Per-server timeout overrides. |
| `protocol` | `legacy`, `auto`, or `2026-07-28`. |

## Remote server

```jsonc
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "remote",
        "url": "https://mcp.context7.com/mcp",
        "oauth": false,
        "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" },
      },
    },
  },
}
```

Remote servers require an absolute Streamable HTTP URL. `oauth: false` is for
API-key or other header authentication only. OAuth credentials remain outside
the configuration file.

## OAuth, timeouts, and protocol

OAuth client fields use snake_case: `client_id`, `client_secret`, `scope`,
`callback_port`, `redirect_uri`, and `auth_server_metadata_url`.

```jsonc
{
  "mcp": {
    "timeout": { "startup": 45000, "catalog": 30000, "execution": 600000 },
    "servers": {
      "modern": {
        "type": "remote",
        "url": "https://mcp.example.com/mcp",
        "protocol": "auto",
      },
    },
  },
}
```

Timeouts are positive milliseconds. Defaults are 30 seconds for startup and
catalog requests, and 12 hours for execution. `legacy` is the default protocol;
use `auto` only for servers that need the 2026-07-28 MCP protocol.

## Permissions

OpenCode normalizes an MCP tool name to `<server>_<tool>`. Control it with
permissions without disconnecting the server:

```jsonc
{
  "permissions": [
    { "action": "context7_*", "resource": "*", "effect": "deny" },
  ],
}
```

Higher-precedence config replaces a server object with the same name. Repeat
all required fields when overriding a server.
