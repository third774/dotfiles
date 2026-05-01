return {
  {
    "folke/tokyonight.nvim",
    opts = {
      -- style = "moon",
      -- transparent = false,
      -- terminal_colors = true,
      -- styles = {
      -- comments = { italic = true },
      -- keywords = { italic = true },
      -- functions = {},
      -- variables = {},
      -- sidebars = "dark",
      -- floats = "dark",
      -- },
      -- sidebars = { "qf", "help" },
      -- day_brightness = 0.3,
      -- hide_inactive_statusline = false,
      -- dim_inactive = false,
      -- lualine_bold = false,

      -- on_colors = function(colors)
      -- Customize colors here
      -- Example customizations (uncomment and modify as needed):
      -- colors.bg = "#1a1b26"
      -- colors.bg_dark = "#16161e"
      -- colors.bg_float = "#16161e"
      -- colors.bg_highlight = "#292e42"
      -- colors.bg_popup = "#16161e"
      -- colors.bg_search = "#3d59a1"
      -- colors.bg_sidebar = "#16161e"
      -- colors.bg_statusline = "#16161e"
      -- colors.bg_visual = "#283457"
      -- colors.border = "#15161e"
      -- colors.comment = "#565f89"
      -- colors.fg = "#c0caf5"
      -- colors.fg_dark = "#a9b1d6"
      -- colors.fg_float = "#c0caf5"
      -- colors.fg_gutter = "#3b4261"
      -- colors.fg_sidebar = "#a9b1d6"
      -- end,

      on_highlights = function(highlights, colors)
        -- Customize highlights here
        highlights.tsxTagName = { fg = colors.purple }

        -- Example customizations (uncomment and modify as needed):
        -- highlights.LineNr = { fg = colors.dark3 }
        -- highlights.CursorLineNr = { fg = colors.orange, bold = true }
        -- highlights.Visual = { bg = colors.bg_visual }
        -- highlights.VisualNOS = { bg = colors.bg_visual }
        -- highlights.Search = { bg = colors.bg_search, fg = colors.fg }
        -- highlights.IncSearch = { bg = colors.orange, fg = colors.black }
        -- highlights.CursorLine = { bg = colors.bg_highlight }
        -- highlights.ColorColumn = { bg = colors.black }
        -- highlights.SignColumn = { bg = colors.bg, fg = colors.fg_gutter }
        -- highlights.VertSplit = { fg = colors.border }
        -- highlights.EndOfBuffer = { fg = colors.bg }
        -- highlights.NormalFloat = { bg = colors.bg_float, fg = colors.fg_float }
        -- highlights.FloatBorder = { bg = colors.bg_float, fg = colors.border }
        -- highlights.Pmenu = { bg = colors.bg_popup, fg = colors.fg }
        -- highlights.PmenuSel = { bg = colors.bg_highlight }
        -- highlights.PmenuSbar = { bg = colors.bg_search }
        -- highlights.PmenuThumb = { bg = colors.fg_gutter }
      end,
    },
  },
}
