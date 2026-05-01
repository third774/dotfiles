vim.filetype.add({
  extension = {
    astro = "astro",
    mdx = "markdown",
    prisma = "prisma",
    tf = "terraform",
  },
})

return {
  "nvim-treesitter/nvim-treesitter",
  opts = {
    highlight = {
      enable = false,
      disable = function(_, bufnr)
        -- Disable highlights for help pages
        if vim.api.nvim_buf_get_option(bufnr, "filetype") == "help" then
          return true
        end
      end,
    },
    ensure_installed = {
      "astro",
      "bash",
      "graphql",
      "html",
      "javascript",
      "json",
      "lua",
      "markdown",
      "markdown_inline",
      "prisma",
      "regex",
      "tsx",
      "typescript",
      "vim",
      "yaml",
    },
    incremental_selection = {
      enable = true,
      keymaps = {
        init_selection = false,
        node_incremental = "v",
        scope_incremental = false,
        node_decremental = "<bs>",
      },
    },
  },
}
