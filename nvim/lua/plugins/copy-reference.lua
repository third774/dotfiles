return {
  "cajames/copy-reference.nvim",
  opts = {},
  keys = {
    {
      "yr",
      "<cmd>CopyReference file<cr>",
      mode = { "n", "v" },
      desc = "Copy file path",
    },
    {
      "yrr",
      "<cmd>CopyReference line<cr>",
      mode = { "n", "v" },
      desc = "Copy file reference",
    },
  },
}
