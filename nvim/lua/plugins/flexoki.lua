-- local dark = true
-- vim.keymap.set('n', '<leader>uD', function()
--   if dark then
--     vim.cmd 'colorscheme flexoki-light'
--     dark = false
--   else
--     vim.cmd 'colorscheme flexoki-dark'
--     dark = true
--   end
-- end, { desc = 'Toggle dark and light color scheme' })

return {
  "kepano/flexoki-neovim",
  priority = 1000,
  lazy = false,
  version = false,
  config = function()
    -- vim.cmd("colorscheme flexoki-dark")
  end,
}
