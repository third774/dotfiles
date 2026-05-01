return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        eslint = {
          settings = {
            workingDirectories = {
              mode = "location",
            },
          },
        },
      },
    },
  },
}
