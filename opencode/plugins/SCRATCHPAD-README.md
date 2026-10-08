# OpenCode Scratchpad Plugin

The `scratchpad` plugin provides session-scoped files under:

```text
.opencode/__sessions/<session-id>/
```

It creates `index.md` for new sessions and adds that file to the context of a
compaction request. It provides these tools:

- `session_scratch_write`
- `session_scratch_read`
- `session_scratch_list`

Add `.opencode/__sessions/` to each project's ignore rules. The plugin is
loaded automatically from this global `plugins/` directory.
