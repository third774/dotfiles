return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        vtsls = {
          settings = {
            typescript = {
              tsserver = {
                maxTsServerMemory = 8192,
              },
              preferences = {
                importModuleSpecifierPreference = "non-relative",
              },
            },
          },
        },
      },
    },
  },
}
