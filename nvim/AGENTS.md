# AGENTS.md

Guidelines for AI coding agents working in this LazyVim-based Neovim configuration.

## Build & Lint Commands

```bash
# Format all Lua files
stylua lua/**/*.lua

# Format specific file
stylua lua/plugins/example.lua

# Check formatting (dry run)
stylua --check lua/**/*.lua
```

**LSP**: Language servers are managed through Mason plugin. No CLI commands needed - use `:Mason` in Neovim or configure in `lua/plugins/mason.lua`.

**No test framework**: This is a configuration repo, not a library. Verify changes by opening Neovim and testing functionality.

## Directory Structure

```
lua/
├── config/
│   ├── lazy.lua      # LazyVim bootstrap - rarely modify
│   ├── options.lua   # Neovim options (vim.opt, vim.g)
│   ├── keymaps.lua   # Custom keybindings
│   └── autocmds.lua  # Autocommands
└── plugins/          # One file per plugin or plugin group
    ├── core.lua      # LazyVim core options
    ├── [plugin].lua  # Individual plugin configs
    └── ...
```

## Plugin Configuration Patterns

### Standard Pattern (opts table)

```lua
return {
  "author/plugin-name",
  opts = {
    option_one = true,
    nested = {
      setting = "value",
    },
  },
}
```

### With Keybindings

```lua
return {
  "author/plugin-name",
  opts = { ... },
  keys = {
    { "<leader>x", function() ... end, desc = "Description" },
    { "<leader>X", "<cmd>Command<cr>", desc = "Other action" },
  },
}
```

### Dynamic Keybindings

```lua
return {
  "author/plugin-name",
  keys = function()
    local keys = {
      { "<leader>m", function() ... end, desc = "Main action" },
    }
    for i = 1, 5 do
      table.insert(keys, {
        "<leader>" .. i,
        function() require("plugin"):select(i) end,
        desc = "Select " .. i,
      })
    end
    return keys
  end,
}
```

### Extending Default Options

```lua
return {
  "author/plugin-name",
  event = "VeryLazy",
  opts = function(_, opts)
    -- Modify existing opts table
    table.insert(opts.sources, { name = "new_source" })
    opts.settings.feature = true
    return opts
  end,
}
```

### LSP Server Configuration

```lua
return {
  "neovim/nvim-lspconfig",
  opts = {
    servers = {
      server_name = {
        settings = {
          option = "value",
        },
      },
    },
  },
}
```

### Disabling a Plugin

```lua
return {
  "author/plugin-name",
  enabled = false,
}
```

## Code Style

### Formatting (enforced by stylua.toml)

- **Indentation**: 2 spaces
- **Line width**: 120 characters max
- **Quote style**: Double quotes for strings

### Imports

```lua
-- Local requires at top of file
local module = require("module_name")

-- Inline requires for lazy-loaded functionality
keys = {
  { "<leader>x", function() require("plugin").action() end },
}
```

### Keybinding Conventions

```lua
-- Always include desc for discoverability
vim.keymap.set("n", "<leader>x", function() ... end, { desc = "Action description" })

-- Use noremap for direct mappings
vim.keymap.set("n", "<C-x>", "<C-w>", { noremap = true, desc = "..." })

-- Multi-mode bindings
vim.keymap.set({ "n", "v" }, "<leader>y", '"+y', { desc = "Yank to clipboard" })
```

### Naming

- Plugin files: Match main plugin name (`telescope.lua`, `harpoon.lua`)
- Variables: Descriptive, follow Neovim API patterns
- Keymap descriptions: Concise action descriptions

### Error Handling

```lua
-- Conditional feature checks
if vim.fn.has("nvim-0.10") == 1 then
  -- Use new API
end

-- Optional plugin checks
{
  "plugin/name",
  optional = true,  -- Won't error if not installed
  opts = { ... },
}
```

## Common Configuration Options

```lua
-- In lua/config/options.lua

-- Disable auto-formatting globally
vim.g.autoformat = false

-- Use cwd as root (not LSP or .git detection)
vim.g.root_spec = { "cwd" }

-- Disable snacks animations
vim.g.snacks_animate = false

-- Disable lazygit theme override
vim.g.lazygit_config = false
```

## LazyVim Extras

Enabled extras (in `lazyvim.json`):
- `coding.yanky` - Yank ring
- `editor.aerial` - Code outline
- `editor.mini-files` - File explorer
- `formatting.prettier` - Prettier integration
- `linting.eslint` - ESLint integration
- `util.dot` - Dotfile syntax

To add extras, use `:LazyExtras` in Neovim or edit `lazyvim.json`.

## Adding a New Plugin

1. Create `lua/plugins/plugin-name.lua`
2. Return a LazyVim spec table
3. Format with `stylua lua/plugins/plugin-name.lua`
4. Restart Neovim or run `:Lazy`

Example:

```lua
-- lua/plugins/new-plugin.lua
return {
  "author/new-plugin",
  event = "VeryLazy",  -- Lazy load
  dependencies = {
    "nvim-lua/plenary.nvim",
  },
  opts = {
    feature = true,
  },
  keys = {
    { "<leader>np", "<cmd>NewPluginCommand<cr>", desc = "New Plugin" },
  },
}
```

## Modifying Keymaps

Edit `lua/config/keymaps.lua`:

```lua
-- Add new keymap
vim.keymap.set("n", "<leader>xx", function()
  -- action
end, { desc = "My action" })

-- Remove LazyVim default keymap
vim.keymap.del("n", "<A-j>")
```

## Things to Avoid

- **Type assertions**: No `---@type any` or similar
- **Disabling formatoptions in plugin files**: Use autocmds.lua instead
- **Hardcoded paths**: Use `vim.fn.stdpath()` for Neovim paths
- **Inline comments for stylua**: Use `-- stylua: ignore` sparingly
- **Large commented blocks**: Delete unused code, use git history

## Verification Checklist

Before considering changes complete:

1. Run `stylua --check lua/**/*.lua` - formatting passes
2. Open Neovim - no startup errors
3. Test affected functionality - keymaps work, plugins load
4. Check `:checkhealth` if LSP-related changes
