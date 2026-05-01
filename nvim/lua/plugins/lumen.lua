local function get_focused_file()
  local bufname = vim.api.nvim_buf_get_name(0)
  if bufname == "" or vim.fn.filereadable(bufname) ~= 1 then
    return nil
  end
  local git_root = LazyVim.root.git()
  if not git_root then
    return nil
  end
  -- Make path relative to git root
  if bufname:sub(1, #git_root) == git_root then
    local relative = bufname:sub(#git_root + 2) -- +2 to skip trailing slash
    return relative
  end
  return nil
end

local function lumen_diff(args)
  args = args or {}
  local cmd = { "lumen", "diff", "--watch" }
  if args.staged then
    table.insert(cmd, "--staged")
  end
  local focus_file = get_focused_file()
  if focus_file then
    table.insert(cmd, "--focus")
    table.insert(cmd, focus_file)
  end
  Snacks.terminal(cmd, {
    cwd = LazyVim.root.git(),
    win = {
      position = "float",
      width = 0.9,
      height = 0.9,
    },
  })
end

return {
  "folke/snacks.nvim",
  keys = {
    {
      "<leader>gD",
      function()
        lumen_diff()
      end,
      desc = "Git Diff Staged (Lumen)",
    },
  },
  init = function()
    vim.api.nvim_create_autocmd("User", {
      pattern = "LazyVimKeymaps",
      once = true,
      callback = function()
        pcall(vim.keymap.del, "n", "<leader>gd")
      end,
    })
  end,
}
