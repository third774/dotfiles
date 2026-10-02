return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        tsc = { enabled = true },
        tsgo = { enabled = false },
        vtsls = { enabled = false },
      },
    },
  },
}
