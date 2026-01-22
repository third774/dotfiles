# Themes

Customize OpenCode appearance.

## Select Theme

```jsonc
{
  "theme": "tokyonight"
}
```

Or use `/theme` command in TUI.

## Built-in Themes

| Theme | Description |
|-------|-------------|
| `opencode` | Default theme |
| `system` | Adapts to terminal colors |
| `tokyonight` | Tokyo Night |
| `catppuccin` | Catppuccin Mocha |
| `catppuccin-macchiato` | Catppuccin Macchiato |
| `gruvbox` | Gruvbox |
| `nord` | Nord |
| `everforest` | Everforest |
| `ayu` | Ayu Dark |
| `kanagawa` | Kanagawa |
| `one-dark` | Atom One Dark |
| `matrix` | Green on black |

## System Theme

Uses terminal's colors:
- Generates grayscale from terminal background
- Uses ANSI colors (0-15) for syntax
- `"none"` for default text/background

Best for users who want OpenCode to match their terminal.

## Custom Themes

### Location

- `~/.config/opencode/themes/*.json` (global)
- `.opencode/themes/*.json` (project)

Later directories override earlier; project overrides global.

### JSON Format

```json
{
  "$schema": "https://opencode.ai/theme.json",
  "defs": {
    "bg": "#1a1b26",
    "fg": "#c0caf5",
    "accent": "#7aa2f7"
  },
  "theme": {
    "primary": { "dark": "accent", "light": "#2563eb" },
    "text": { "dark": "fg", "light": "#1f2937" },
    "background": { "dark": "bg", "light": "#ffffff" }
  }
}
```

### Color Values

| Format | Example |
|--------|---------|
| Hex | `"#7aa2f7"` |
| ANSI (0-255) | `3` |
| Reference | `"primary"` or custom def |
| Dark/light | `{ "dark": "#000", "light": "#fff" }` |
| Terminal default | `"none"` |

### Theme Properties

**Core:**
- `primary`, `secondary`, `accent`
- `error`, `warning`, `success`, `info`
- `text`, `textMuted`
- `background`, `backgroundPanel`, `backgroundElement`
- `border`, `borderActive`, `borderSubtle`

**Diff:**
- `diffAdded`, `diffRemoved`, `diffContext`, `diffHunkHeader`
- `diffHighlightAdded`, `diffHighlightRemoved`
- `diffAddedBg`, `diffRemovedBg`, `diffContextBg`
- `diffLineNumber`, `diffAddedLineNumberBg`, `diffRemovedLineNumberBg`

**Markdown:**
- `markdownText`, `markdownHeading`, `markdownLink`, `markdownLinkText`
- `markdownCode`, `markdownBlockQuote`, `markdownEmph`, `markdownStrong`
- `markdownHorizontalRule`, `markdownListItem`, `markdownCodeBlock`

**Syntax:**
- `syntaxComment`, `syntaxKeyword`, `syntaxFunction`, `syntaxVariable`
- `syntaxString`, `syntaxNumber`, `syntaxType`, `syntaxOperator`, `syntaxPunctuation`

## Terminal Requirements

For full color support, terminal must support **truecolor** (24-bit).

Check: `echo $COLORTERM` should output `truecolor` or `24bit`.

Enable: `export COLORTERM=truecolor` in shell profile.

## Example: Minimal Custom Theme

`~/.config/opencode/themes/my-theme.json`:

```json
{
  "$schema": "https://opencode.ai/theme.json",
  "defs": {
    "base": "#1e1e2e",
    "surface": "#313244",
    "text": "#cdd6f4",
    "blue": "#89b4fa",
    "green": "#a6e3a1",
    "red": "#f38ba8"
  },
  "theme": {
    "primary": { "dark": "blue", "light": "blue" },
    "text": { "dark": "text", "light": "#1e1e2e" },
    "background": { "dark": "base", "light": "#eff1f5" },
    "backgroundPanel": { "dark": "surface", "light": "#e6e9ef" },
    "success": { "dark": "green", "light": "green" },
    "error": { "dark": "red", "light": "red" }
  }
}
```

Use with: `"theme": "my-theme"`
