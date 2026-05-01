return {
  "stevearc/oil.nvim",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  config = function()
    require("oil").setup()
    vim.keymap.set({ "n", "v" }, "<leader>o", "<CMD>Oil<CR>", { desc = "Oil open parent directory" })
  end,
}
