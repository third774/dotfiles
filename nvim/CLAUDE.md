# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Lint Commands

- Format code: `stylua lua/**/*.lua`
- LSP: Language servers managed through Mason plugin

## LazyVim Configuration

### Plugin Configuration Pattern

```lua
-- Use opts table for plugin configuration (new method)
{ "PluginName/plugin", opts = { ... } }

-- Example: Configure LSP diagnostics
{ "neovim/nvim-lspconfig", opts = { diagnostics = {} } }

-- Example: Disable LSP inlay hints
{
  "nvim-lspconfig",
  opts = {
    inlay_hints = { enabled = false },
  }
}
```

### Common Configuration Options

```lua
-- Disable LazyVim animations
vim.g.snacks_animate = false

-- Disable automatic lazygit theme
vim.g.lazygit_config = false

-- Disable auto-formatting globally or per buffer
vim.g.autoformat = false -- globally
vim.b.autoformat = false -- buffer-local

-- Configure root directory detection
vim.g.root_spec = { "lsp", { ".git", "lua" }, "cwd" }
-- Simplify to only use current directory
vim.g.root_spec = { "cwd" }

-- Change Python LSP (default is pyright)
vim.g.lazyvim_python_lsp = "basedpyright"

-- Disable LazyVim order check warning
vim.g.lazyvim_check_order = false
```

### Directory Structure

- `lua/plugins/` - One file per plugin or related plugin group
- Each plugin file should return a table with LazyVim spec format
- Use descriptive filenames that match the main plugin being configured

## Code Style Guidelines

- **Formatting**:

  - Use 2 spaces for indentation
  - Maximum line length of 120 characters
  - Use StyleLua for consistent formatting

- **Imports**:

  - Local requires: `local module = require("module_name")`
  - Core imports first, followed by custom plugins
  - Plugin configs should return tables with spec format

- **Plugin Structure**:

  - Configure plugins using `opts = {}` pattern
  - Follow LazyVim extension conventions
  - Return a table from each plugin file

- **Naming Conventions**:

  - Use descriptive variable names
  - Follow Neovim API naming patterns
  - Use consistent keymap descriptions

- **Error Handling**:
  - Use conditional checks for optional features
  - Support feature detection with fallbacks

