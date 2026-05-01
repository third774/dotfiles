return {
  "nvim-telescope/telescope.nvim",
  opts = {
    defaults = {
      path_display = { "smart" },
    },
  },
  keys = {
    {
      "<leader>fc",
      function()
        require("telescope.builtin").find_files({
          cwd = vim.fn.stdpath("config"),
          search_dirs = {
            vim.fn.stdpath("config"),
            "~/.dotfiles",
          },
        })
      end,
      desc = "Find Config File",
    },
  },
}
