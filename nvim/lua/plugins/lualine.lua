return {
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    opts = function(_, opts)
      -- Add filetype (language) to the lualine_x section
      table.insert(opts.sections.lualine_x, 1, {
        "filetype",
        icon_only = false,
        colored = true,
      })
      -- Configure filename to not truncate
      opts.sections.lualine_c = {
        {
          "filename",
          path = 1, -- 0 = just filename, 1 = relative path, 2 = absolute path
          shorting_target = 0, -- Don't shorten path
          symbols = {
            modified = "[+]",
            readonly = "[-]",
            unnamed = "[No Name]",
            newfile = "[New]",
          },
        },
      }
    end,
  },
}
