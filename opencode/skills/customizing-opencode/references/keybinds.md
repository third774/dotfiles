# Keybinds

Configure terminal keybinds in `~/.config/opencode/cli.json`, not in
`opencode.json(c)`.

```jsonc
{
  "keybinds": {
    "leader": "ctrl+space",
    "command.palette.show": "ctrl+k",
    "app.exit": ["ctrl+c", "ctrl+d"],
    "app.debug": false,
  },
  "leader": { "timeout": 1500 },
}
```

Use one string, a comma-separated string, or an array for alternatives. Disable
a keybind with `"none"` or `false`. Use an object when browser or terminal event
handling needs control:

```jsonc
{
  "keybinds": {
    "prompt.paste": { "key": "ctrl+v", "preventDefault": false },
  },
}
```

The default leader is `ctrl+x`; use `<leader>` inside other bindings. Unknown
command IDs are rejected.

## Common command IDs

| Area | IDs and defaults |
| --- | --- |
| Application | `app.exit` (`ctrl+c,ctrl+d,<leader>q`), `command.palette.show` (`ctrl+p`), `opencode.settings` (`none`) |
| Appearance | `prompt.editor` (`<leader>e`), `session.sidebar.toggle` (`<leader>b`), `terminal.toggle` (`<leader>t`), `opencode.status` (`<leader>s`) |
| Sessions | `session.new` (`<leader>n`), `session.list` (`<leader>l`), `session.interrupt` (`escape`), `session.compact` (`<leader>c`), `session.timeline` (`<leader>g`) |
| Models and agents | `model.list` (`<leader>m`), `model.cycle_recent` (`f2`), `agent.list` (`<leader>a`), `agent.cycle` (`shift+tab`), `variant.cycle` (`ctrl+t`) |
| Session navigation | `session.page.up`, `session.page.down`, `session.first`, `session.last`, `messages.copy` (`<leader>y`), `session.undo` (`<leader>u`), `session.redo` (`<leader>r`) |
| Prompt and input | `prompt.queue` (`<leader>return`), `prompt.clear` (`ctrl+c`), `input.submit` (`return`), `input.newline` (`shift+return,ctrl+return,alt+return,ctrl+j`) |
| Terminal | `terminal.suspend` (`ctrl+z`), `plugins.list` (`none`), `mcp.list` (`none`) |

The full current command-ID list is in the OpenCode V2 keybind reference. Do
not use V1 underscore IDs such as `session_new`, `app_exit`, or `model_list`.
