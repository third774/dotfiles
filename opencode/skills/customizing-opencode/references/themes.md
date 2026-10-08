# Themes

Themes are terminal-client settings. Select a theme in
`~/.config/opencode/cli.json`, not `opencode.json(c)`:

```jsonc
{
  "theme": {
    "name": "tokyonight",
    "mode": "system",
  },
}
```

Use `system` to follow terminal appearance, `dark` to lock dark mode, or
`light` to lock light mode. The terminal UI can also change the setting through
the command palette: **Open settings** → **Theme**.

## Built-in themes

Built-in names include `aura`, `ayu`, `carbonfox`, `cobalt2`, `cursor`,
`dracula`, `everforest`, `flexoki`, `catppuccin`, `catppuccin-frappe`,
`catppuccin-macchiato`, `github`, `gruvbox`, `kanagawa`, `material`, `matrix`,
`mercury`, `monokai`, `nightowl`, `nord`, `one-dark`, `opencode`, `orng`,
`lucent-orng`, `osaka-jade`, `palenight`, `rosepine`, `solarized`,
`synthwave84`, `tokyonight`, `vercel`, `vesper`, and `zenburn`. `system` is
available when OpenCode can read the terminal palette.

## Custom themes

Save JSON files in `~/.config/opencode/themes/` globally or
`.opencode/themes/` for a project. The filename without `.json` is the theme
name. A nearer project theme with the same name replaces an ancestor or global
theme.

A V2 theme needs a complete `base` token tree and at least one `light` or
`dark` hue palette. Generate a complete theme with the theme tool before
customizing it. This is an excerpt, not a complete theme:

```json
{
  "base": {
    "text": { "base": "#d8f3ff", "muted": "$hue.neutral.400" },
    "background": { "base": "#071521" },
    "syntax": { "comment": "$hue.neutral.500", "keyword": "$hue.accent.400" }
  },
  "dark": {
    "hue": { "accent": "$hue.cyan", "interactive": "$hue.blue" }
  }
}
```

Colors can be 3-, 4-, 6-, or 8-digit hex values, `transparent`, or `$`-prefixed
references. Hues use `$hue.<name>.<step>`, where names include the base colors
and aliases `accent`, `interactive`, and `neutral`; steps range from `100` to
`900`. Token groups include `text`, `background`, `border`, `scrollbar`,
`diff`, `syntax`, and `markdown`.
