# Keybinds

Customize keyboard shortcuts.

## Leader Key

Most keybinds require pressing a leader key first. Default: `ctrl+x`

```jsonc
{
  "keybinds": {
    "leader": "ctrl+o"  // Change leader to ctrl+o
  }
}
```

Usage: Press leader, then the action key (e.g., `ctrl+o` then `n` for new session).

## Disable a Keybind

Set to `"none"`:

```jsonc
{
  "keybinds": {
    "session_compact": "none",
    "scrollbar_toggle": "none"
  }
}
```

## Multiple Bindings

Comma-separated:

```jsonc
{
  "keybinds": {
    "app_exit": "ctrl+c,ctrl+d,<leader>q"
  }
}
```

## Key Actions

### App

| Action | Default | Description |
|--------|---------|-------------|
| `app_exit` | `ctrl+c,ctrl+d,<leader>q` | Exit OpenCode |
| `terminal_suspend` | `ctrl+z` | Suspend to background |

### Session

| Action | Default | Description |
|--------|---------|-------------|
| `session_new` | `<leader>n` | New session |
| `session_list` | `<leader>l` | List sessions |
| `session_interrupt` | `escape` | Stop generation |
| `session_compact` | `<leader>c` | Compact context |
| `session_export` | `<leader>x` | Export session |
| `session_timeline` | `<leader>g` | View timeline |
| `session_child_cycle` | `<leader>right` | Cycle to child session |
| `session_child_cycle_reverse` | `<leader>left` | Cycle to parent session |
| `session_parent` | `<leader>up` | Go to parent session |

### Messages

| Action | Default | Description |
|--------|---------|-------------|
| `messages_page_up` | `pageup,ctrl+alt+b` | Page up |
| `messages_page_down` | `pagedown,ctrl+alt+f` | Page down |
| `messages_first` | `ctrl+g,home` | Go to first message |
| `messages_last` | `ctrl+alt+g,end` | Go to last message |
| `messages_copy` | `<leader>y` | Copy messages |
| `messages_undo` | `<leader>u` | Undo last change |
| `messages_redo` | `<leader>r` | Redo change |
| `messages_toggle_conceal` | `<leader>h` | Toggle tool output |

### Model/Agent

| Action | Default | Description |
|--------|---------|-------------|
| `model_list` | `<leader>m` | Select model |
| `model_cycle_recent` | `f2` | Cycle recent models |
| `agent_list` | `<leader>a` | Select agent |
| `agent_cycle` | `tab` | Cycle primary agents |
| `agent_cycle_reverse` | `shift+tab` | Cycle agents reverse |

### UI

| Action | Default | Description |
|--------|---------|-------------|
| `editor_open` | `<leader>e` | Open in editor |
| `theme_list` | `<leader>t` | Select theme |
| `sidebar_toggle` | `<leader>b` | Toggle sidebar |
| `status_view` | `<leader>s` | View status |
| `command_list` | `ctrl+p` | Command palette |

### Input

| Action | Default | Description |
|--------|---------|-------------|
| `input_clear` | `ctrl+c` | Clear input |
| `input_paste` | `ctrl+v` | Paste |
| `input_submit` | `return` | Submit message |
| `input_newline` | `shift+return,ctrl+j` | Insert newline |
| `input_undo` | `ctrl+-,super+z` | Undo input |
| `input_redo` | `ctrl+.,super+shift+z` | Redo input |

## Full Default Config

```jsonc
{
  "keybinds": {
    "leader": "ctrl+x",
    "app_exit": "ctrl+c,ctrl+d,<leader>q",
    "session_new": "<leader>n",
    "session_list": "<leader>l",
    "session_interrupt": "escape",
    "agent_cycle": "tab",
    "model_list": "<leader>m",
    "input_submit": "return",
    "input_newline": "shift+return,ctrl+return,alt+return,ctrl+j"
  }
}
```

## Shift+Enter in Windows Terminal

Add to `settings.json`:

```json
{
  "actions": [{
    "command": { "action": "sendInput", "input": "\u001b[13;2u" },
    "id": "User.sendInput.ShiftEnterCustom"
  }],
  "keybindings": [{
    "keys": "shift+enter",
    "id": "User.sendInput.ShiftEnterCustom"
  }]
}
```
