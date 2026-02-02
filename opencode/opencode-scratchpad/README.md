# opencode-scratchpad

Session-scoped scratch space that survives compaction. Keep notes, file references, and session state in a persistent directory that gets included in context during compaction.

## Installation

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-scratchpad"]
}
```

## Tools

| Tool | Description |
|------|-------------|
| `session_scratch_write` | Write content to a file in the scratch space |
| `session_scratch_read` | Read content from a file in the scratch space |
| `session_scratch_list` | List all files in the scratch space |

## File Location

Scratch files are stored in:

```
.opencode/__sessions/{sessionID}/
```

Each session gets its own isolated directory. The `index.md` file is automatically created and included in context during compaction.

## Gitignore

Add to `.gitignore` or `.git/info/exclude`:

```
.opencode/__sessions/
```

This prevents session scratch files from being committed to version control.

## How It Works

1. **Session Start**: When a new session is created, the plugin initializes a scratch directory and creates an `index.md` template.

2. **Tools Available**: Use the three tools to write, read, and list files in your session scratch space.

3. **Index File**: Update `index.md` with brief pointers about what you're working on, files you've created, and current state.

4. **Compaction**: When the session compacts context, the `index.md` content is automatically included, preserving key information.

5. **Restoration**: On the next session, you can use `session_scratch_read` to load specific files and continue where you left off.

## Example Usage

```
User: Update the index.md with what we're working on

Agent: I'll write to the scratch space.
Tool: session_scratch_write
  filename: index.md
  content: # Session Scratch Space
  
  ## Purpose
  Implementing user authentication system
  
  ## Files
  - auth-schema.sql: Database schema for users
  - auth-service.ts: Main authentication logic
  
  ## Current State
  Completed schema and service. Next: write tests.
```

Later, in a new session:

```
User: What were we working on?

Agent: Let me check the scratch space.
Tool: session_scratch_read
  filename: index.md
  
Returns the content from the previous session.
```
