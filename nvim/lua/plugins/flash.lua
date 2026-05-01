return {
  "folke/flash.nvim",
  opts = {
    modes = {
      search = {
        enabled = true,
      },
    },
    label = {
      rainbow = {
        enabled = true,
        -- number between 1 and 9
        shade = 3,
      },
    },
    jump = {
      register = true,
    },
  },
  keys = function()
    return {
      {
        "<leader>j",
        mode = { "n" },
        function()
          require("flash").jump()
        end,
        desc = "Flash Jump",
      },
      {
        "<leader>v",
        mode = { "n", "v", "x", "o" },
        function()
          require("flash").treesitter()
        end,
        desc = "Flash Treesitter",
      },
      {
        "<S-r>",
        mode = { "n", "v", "x", "o" },
        function()
          require("flash").treesitter_search()
        end,
        desc = "Flash Treesitter Search",
      },
    }
  end,
}
