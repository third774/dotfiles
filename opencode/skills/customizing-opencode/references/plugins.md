# Plugins

Plugins extend OpenCode server behavior. OpenCode automatically discovers
global plugin files in `~/.config/opencode/plugins/` and project plugin files
in `.opencode/plugins/`. It loads direct `.ts` and `.js` files and immediate
package directories.

Load a package or another local path with `plugins` in `opencode.json(c)`:

```jsonc
{
  "plugins": [
    "@acme/opencode-plugin",
    "./plugins/company",
    { "package": "./plugins/strict", "options": { "strict": true } },
  ],
}
```

Relative paths resolve from the config file that declares them. Plugin arrays
from applicable configuration files append in precedence order.

## Plugin structure

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "company.example",
  setup(ctx) {
    console.log(`Loaded OpenCode ${ctx.app.version}`)
    const strict = ctx.options.strict === true
    return () => console.log(`Unloaded strict=${strict}`)
  },
})
```

`setup` can return cleanup logic. Use `ctx.options` for options supplied by the
object form of `plugins`.

## Transforms and hooks

Use transforms to register or change tools, agents, commands, providers, MCP
servers, references, skills, and worktree strategies. Transforms are synchronous
edits to their domain state. Load external data before a callback, then call the
domain's `reload()` method after that data changes.

Use session hooks to change an operation as it runs:

```ts
await ctx.session.hook("context", (event) => {
  event.system.push({ type: "text", text: "Focus on correctness." })
  delete event.tools.write
})
```

`context` changes agent-loop model requests. Use `prompt`, `compaction`,
`generate`, or `title` for those specific flows. Use `model.request`,
`http.request`, or `http.response` only when provider-level request control is
required.

## Package management

```sh
opencode plugin add @acme/opencode-plugin@latest
opencode plugin list
opencode plugin check
opencode plugin update
opencode plugin remove @acme/opencode-plugin@latest
```

Prefix an ID or wildcard with `-` to disable a configured plugin. `*` matches
every plugin and `.*` matches an ID prefix. A later entry re-enables a plugin.

CLI-only plugins are separate terminal configuration in `cli.json`:

```json
{ "plugins": ["opencode-acme-cli"] }
```

Use `@opencode/plugin`. Do not use `@opencode-ai/plugin` or V1 returned-hook
objects.
