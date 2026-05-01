return {
  "f-person/git-blame.nvim",
  event = "BufRead",
  cmd = "GitBlameToggle",
  config = function()
    vim.cmd("let g:gitblame_enabled = 0") -- Enable git blame by default
    vim.cmd('let g:gitblame_message_template = "<summary> • <date> • <author>"')
    vim.cmd('let g:gitblame_date_format = "%r"')
  end,
}
