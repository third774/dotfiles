# Custom Tools

Define functions the LLM can call during conversations.

## Location

- `~/.config/opencode/tools/` (global)
- `.opencode/tools/` (project)

Filename becomes tool name (e.g., `database.ts` creates `database` tool).

## Basic Structure

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Query the project database",
  args: {
    query: tool.schema.string().describe("SQL query to execute")
  },
  async execute(args) {
    // Implementation
    return `Result: ${args.query}`
  }
})
```

## Multiple Tools per File

Each export becomes a tool named `<filename>_<export>`:

```typescript
// math.ts -> math_add, math_multiply
import { tool } from "@opencode-ai/plugin"

export const add = tool({
  description: "Add two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number")
  },
  async execute(args) {
    return args.a + args.b
  }
})

export const multiply = tool({
  description: "Multiply two numbers",
  args: {
    a: tool.schema.number(),
    b: tool.schema.number()
  },
  async execute(args) {
    return args.a * args.b
  }
})
```

## Arguments with Zod

`tool.schema` is Zod. Full schema support:

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Process data",
  args: {
    name: tool.schema.string().min(1).describe("Item name"),
    count: tool.schema.number().int().positive().optional(),
    tags: tool.schema.array(tool.schema.string()),
    type: tool.schema.enum(["a", "b", "c"])
  },
  async execute(args) {
    return JSON.stringify(args)
  }
})
```

Or import Zod directly:

```typescript
import { z } from "zod"

export default {
  description: "My tool",
  args: {
    param: z.string()
  },
  async execute(args, context) {
    return "result"
  }
}
```

## Context

Access session info in execute:

```typescript
export default tool({
  description: "Get session info",
  args: {},
  async execute(args, context) {
    const { agent, sessionID, messageID } = context
    return `Agent: ${agent}, Session: ${sessionID}`
  }
})
```

## Invoking Other Languages

Tool definitions must be TypeScript/JavaScript, but can invoke any language:

### Python Example

`.opencode/tools/add.py`:
```python
import sys
a = int(sys.argv[1])
b = int(sys.argv[2])
print(a + b)
```

`.opencode/tools/python-add.ts`:
```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Add numbers using Python",
  args: {
    a: tool.schema.number(),
    b: tool.schema.number()
  },
  async execute(args) {
    const result = await Bun.$`python3 .opencode/tools/add.py ${args.a} ${args.b}`.text()
    return result.trim()
  }
})
```

### Shell Script Example

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Run custom script",
  args: {
    input: tool.schema.string()
  },
  async execute(args) {
    const result = await Bun.$`./scripts/process.sh ${args.input}`.text()
    return result
  }
})
```

## Permissions

Control tool access via config:

```jsonc
{
  "permission": {
    "mytool": "ask"  // allow, ask, deny
  }
}
```

Or per-agent:

```jsonc
{
  "agent": {
    "restricted": {
      "tools": {
        "dangerous-tool": false
      }
    }
  }
}
```
