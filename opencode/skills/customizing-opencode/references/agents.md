# Agents

Agents are reusable assistant profiles with a system prompt, model, mode, and
ordered permissions.

## Locations

Save global agents in `~/.config/opencode/agents/`. Save project agents in
`.opencode/agents/`. The filename becomes the agent ID.

## Markdown agent

```md
---
description: Reviews code without changing files
mode: subagent
model: anthropic/claude-sonnet-4-5#high
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
---

Review the changes. Report findings in severity order.
```

The Markdown body is the agent system prompt.

## JSON configuration

```jsonc
{
  "agents": {
    "code-reviewer": {
      "description": "Reviews code without changing files",
      "mode": "subagent",
      "model": "anthropic/claude-sonnet-4-5#high",
      "system": "Review the changes. Report findings in severity order.",
      "permissions": [
        { "action": "edit", "resource": "*", "effect": "deny" },
      ],
    },
  },
}
```

## Options

| Field | Description |
| --- | --- |
| `description` | Explains a subagent's purpose. |
| `mode` | `primary`, `subagent`, or `all`. |
| `model` | `provider/model`, with an optional `#variant`. |
| `system` | System prompt in JSON configuration. |
| `permissions` | Ordered action, resource, and effect rules. |
| `steps` | Positive limit for model steps. |
| `hidden` | Hides the agent from normal listings. |
| `color` | Six-digit hex color for the agent UI. |
| `disabled` | Removes an agent from configuration. |
| `request` | Request header and body overlays. |

## Subagent permissions

Use the `subagent` action to control which child agents an agent can start.
The last matching rule wins. A child uses its own configured permissions, not a
subset of its parent's permissions.

```jsonc
{
  "agents": {
    "orchestrator": {
      "permissions": [
        { "action": "subagent", "resource": "*", "effect": "deny" },
        { "action": "subagent", "resource": "reviewer", "effect": "allow" },
      ],
    },
  },
}
```

## Request settings

Put provider-specific settings in `request.body`. The current V2 session
runner preserves these values but does not send them with model requests. Use
provider, model, or model-variant settings for active request behavior.
