# OpenCode Scratchpad Plugin

The `scratchpad` plugin provides session-scoped files under:

```text
.opencode/__scratchpad_plugin_sessions/<session-id>/
```

It creates `index.md` for new sessions, adds that file to the context of a
compaction request, and adds `.opencode/__scratchpad_plugin_sessions/` to the project's
`.git/info/exclude` file. It provides these tools:

- `session_scratch_write`
- `session_scratch_read`
- `session_scratch_list`

The plugin is loaded automatically from this global `plugins/` directory.
