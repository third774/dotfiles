-- Keymaps are automatically loaded on the VeryLazy event
-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here

vim.keymap.set({ "n", "v" }, "<C-d>", "<C-d>zz")
vim.keymap.set({ "n", "v" }, "<C-u>", "<C-u>zz")
vim.keymap.set({ "i", "c" }, "<M-BS>", "<C-W>", { noremap = true, desc = "Delete word backwards" })
vim.keymap.set("i", "<S-Tab>", "<C-d>", { noremap = true, desc = "De-indent" })
vim.keymap.set({ "n", "v" }, "<leader>y", '"+y', { noremap = true, desc = "Yank to system clipboard" })
vim.keymap.set("n", "<leader>Y", '"+', { noremap = true, desc = "Use clipboard register" })
vim.keymap.set({ "n", "v" }, "<leader>bs", "<cmd>w<cr>", { noremap = true, desc = "Save buffer" })
vim.keymap.set({ "n", "v" }, "<leader>sj", "<cmd>FzfLua jumps<cr>", { desc = "Jumplist" })
vim.keymap.set({ "v" }, "<leader>/", "<cmd>FzfLua grep_visual<cr>", { desc = "Find string under cursor" })
vim.keymap.set({ "n", "v" }, "<leader>su", "<cmd>FzfLua grep_visual<cr>", { desc = "Find string under cursor" })
vim.keymap.set({ "n", "v" }, "<leader>cL", "<cmd>LspRestart<cr>", { desc = "Restart Language Server" })
vim.keymap.set("i", "<M-->", "–", { desc = "Insert En Dash" })
vim.keymap.set("i", "<M-_>", "—", { desc = "Insert Em Dash" })

-- Move lines up/down in visual mode
vim.keymap.set("v", "<M-Up>", ":m '<-2<CR>gv=gv", { desc = "Move lines up" })
vim.keymap.set("v", "<M-Down>", ":m '>+1<CR>gv=gv", { desc = "Move lines down" })

-- Optional: Also add for normal mode (moves current line)
vim.keymap.set("n", "<M-Up>", ":m .-2<CR>==", { desc = "Move line up" })
vim.keymap.set("n", "<M-Down>", ":m .+1<CR>==", { desc = "Move line down" })

-- Optional: Also add for insert mode
vim.keymap.set("i", "<M-Up>", "<Esc>:m .-2<CR>==gi", { desc = "Move line up" })
vim.keymap.set("i", "<M-Down>", "<Esc>:m .+1<CR>==gi", { desc = "Move line down" })

-- For use with vtsls
-- vim.keymap.set("n", "<leader>co", "<cmd>VtsExec organize_imports<CR>", { desc = "Organize Imports" })
-- vim.keymap.set("n", "<leader>cx", "<cmd>VtsExec fix_all<CR>", { desc = "Fix All" })

-- https://github.com/LunarVim/LunarVim/issues/1857
vim.keymap.del("i", "<A-j>")
vim.keymap.del("i", "<A-k>")
vim.keymap.del("n", "<A-j>")
vim.keymap.del("n", "<A-k>")
vim.keymap.del("v", "<A-j>")
vim.keymap.del("v", "<A-k>")

-- vim.keymap.set({ "n", "v" }, "<leader>op", function()
-- 	-- Get current working directory
-- 	local cwd = vim.fn.getcwd()
--
-- 	-- Get file path with line numbers
-- 	local file_ref = get_file_ref()
--
-- 	-- Prompt for user input
-- 	vim.ui.input({
-- 		prompt = "OpenCode task: ",
-- 		default = "",
-- 	}, function(input)
-- 		-- Check if input was provided
-- 		if not input or input == "" then
-- 			vim.notify("No input provided", vim.log.levels.WARN)
-- 			return
-- 		end
--
-- 		-- Build the command with file reference prepended to input
-- 		local cmd = {
-- 			"opencode",
-- 			"run",
-- 			"--model",
-- 			"anthropic/claude-haiku-4-5",
-- 			file_ref .. " " .. input,
-- 		}
--
-- 		vim.notify("Running: " .. input, vim.log.levels.INFO)
--
-- 		-- Use vim.system to run the command asynchronously
-- 		vim.system(cmd, {
-- 			cwd = cwd,
-- 			text = true,
-- 		}, function(result)
-- 			vim.schedule(function()
-- 				if result.code == 0 then
-- 					-- Reload the buffer to reflect any changes
-- 					vim.cmd("edit!")
--
-- 					-- Show output if available
-- 					if result.stdout and result.stdout ~= "" then
-- 						-- Split output into lines for better display
-- 						local lines = vim.split(result.stdout, "\n", { trimempty = true })
-- 						vim.notify("Task Completed ✅\n" .. table.concat(lines, "\n"), vim.log.levels.INFO)
-- 					end
-- 				else
-- 					-- Error
-- 					local error_msg = "OpenCode task failed with code " .. result.code
-- 					if result.stderr and result.stderr ~= "" then
-- 						error_msg = error_msg .. "\n" .. result.stderr
-- 					end
-- 					vim.notify(error_msg, vim.log.levels.ERROR)
-- 				end
-- 			end)
-- 		end)
-- 	end)
-- end, {
-- 	desc = "Run OpenCode with user input and file reference",
-- 	noremap = true,
-- 	silent = true,
-- })
