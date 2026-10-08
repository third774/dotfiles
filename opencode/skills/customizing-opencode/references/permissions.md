# Permissions

Permissions are ordered rules. Each rule has an `action`, a `resource`, and an
`effect` of `allow`, `ask`, or `deny`. The last matching rule wins.

```jsonc
{
  "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" },
  ],
}
```

## Built-in actions

| Action | Resource |
| --- | --- |
| `read`, `edit` | File path |
| `glob`, `grep` | Requested glob or search expression |
| `shell` | Shell command |
| `subagent` | Agent ID |
| `skill` | Skill ID |
| `question` | `*` |
| `webfetch`, `websearch` | URL or search query |
| `external_directory` | Canonical external directory boundary |
| `<server>_<tool>` | An MCP tool resource |
| `execute` | `*`; enables Code Mode, while nested tool checks still apply |

## Agent rules

Top-level rules apply to all agents. Agent rules append after them and can make
the policy more specific.

```yaml
---
description: Read-only reviewer
mode: subagent
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
  - action: shell
    resource: "git diff *"
    effect: allow
---
```

## External directories

Access outside the active location needs `external_directory` approval before
the read or edit rule applies. OpenCode expands `~` and `$HOME` for `read`,
`edit`, and `external_directory` resources when it loads configuration. Shell
resources are raw command text and do not expand them.

```jsonc
{
  "permissions": [
    { "action": "external_directory", "resource": "~/reference/*", "effect": "allow" },
    { "action": "read", "resource": "~/reference/*", "effect": "allow" },
    { "action": "edit", "resource": "~/reference/*", "effect": "deny" },
  ],
}
```
