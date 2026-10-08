# Custom Tools

OpenCode V2 custom tools are registered by a server plugin. There is no
standalone `.opencode/tools/` directory.

```ts
import { Plugin } from "@opencode/plugin"

function queryFrom(input: unknown): string | undefined {
  if (typeof input !== "object" || input === null) return undefined
  if (!("query" in input)) return undefined

  const query = input.query
  return typeof query === "string" ? query : undefined
}

export default Plugin.define({
  id: "company.tools",
  async setup(ctx) {
    await ctx.tool.transform((editor) => {
      editor.namespace({
        name: "company",
        description: "Company tools",
      })
      editor.add({
        name: "database_query",
        description: "Query the project database",
        input: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
          additionalProperties: false,
        },
        async execute(input, context) {
          const query = queryFrom(input)
          if (!query) return { content: "A query is required." }

          await context.progress({ status: "Querying database" })
          return { content: `Session ${context.sessionID} submitted: ${query}` }
        },
      })
    })
  },
})
```

Define `input` with JSON Schema and validate the received `unknown` input at the
tool boundary. The executor context includes the session, agent, message,
progress reporting, and an abort signal. Pass `context.signal` to cancellable
work such as `fetch`.

The effective name includes the namespace: `company_database_query`. Dots and
unsupported characters become `_`. Use that name in transforms and permissions:

```jsonc
{
  "permissions": [
    { "action": "company_database_query", "resource": "*", "effect": "ask" },
  ],
}
```

Use `ctx.tool.reload()` after changing data captured by a transform callback.
It replays transforms but does not rerun plugin setup.
