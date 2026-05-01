return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        graphql = {
          filetypes = {
            "graphql",
            "typescript",
            "typescriptreact",
            "javascript",
            "javascriptreact",
            "vue",
            "svelte",
          },
          settings = {
            graphql = {
              tagName = "gql",
            },
          },
        },
      },
    },
  },
}
