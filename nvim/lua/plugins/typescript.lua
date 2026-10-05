return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      inlay_hints = {
        enabled = false,
      },
      servers = {
        tsc = { enabled = true },
        tsgo = { enabled = false },
        vtsls = { enabled = false },
      },
    },
  },
}
