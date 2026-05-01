-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here

local opt = vim.opt

opt.scrolloff = 10
opt.conceallevel = 0
opt.clipboard = ""
vim.o.exrc = true

vim.g.root_spec = { "cwd" }
