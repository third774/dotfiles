# DOTFILES KNOWLEDGE BASE

**Generated:** 2026-01-15
**Commit:** ac0fc2c
**Branch:** master

## OVERVIEW

macOS dotfiles: Zsh (oh-my-zsh + p10k), symlink-based config management, Homebrew packages.

## STRUCTURE

```
.dotfiles/
├── script/setup         # Bootstrap entry point
├── .entry-point         # Shell init (sources all configs)
├── .zsh                 # oh-my-zsh plugins + syntax highlighting
├── .aliases             # Git shortcuts, eza/yazi/lazygit
├── utils.sh             # Functions: commit(), gch(), grecent(), fin()
├── .path                # PATH: go, sqlite, cargo, lumen
├── .nvm-setup           # NVM with auto .nvmrc loading
├── .localProfile        # Machine-specific (GITIGNORED)
├── git/gitconfig        # Delta pager, rerere, zdiff3
├── .tmux.conf           # Catppuccin, sesh, vim-navigator
├── opencode/            # AI agent config (has own AGENTS.md)
├── ghostty/             # Terminal + 26 shaders
├── karabiner/           # Keyboard remapping (JSON + TS generators)
├── alacritty/           # Terminal config
├── lazygit/             # Git UI + custom commands
└── raycast/             # 3 extensions
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add shell alias | `.aliases` | Git-focused, keep short |
| Add shell function | `utils.sh` | Interactive workflows |
| Add PATH entry | `.path` | Sourced early |
| Machine-specific config | `.localProfile` | Never commit |
| Add Homebrew package | `Brewfile` | Run `brew bundle` after |
| Git settings | `git/gitconfig` | Included via ~/.gitconfig |
| Tmux keybinds | `.tmux.conf` | `prefix-r` to reload |
| AI agent behavior | `opencode/` | See opencode/AGENTS.md |

## CONVENTIONS

### Shell Config

- Entry point chain: `~/.zshrc` -> `.entry-point` -> modular sources
- `.localProfile` for secrets/machine-specific (gitignored)
- Functions in `utils.sh`, aliases in `.aliases` (no overlap)

### Git Workflow

- `--force-with-lease` (alias `gfph`), never `-f`
- Conventional commits via `commit()` function (uses gum)
- Delta pager with zdiff3 merge conflicts
- Auto-rebase on pull

### Tmux

- `T` or `C-space`: sesh session picker
- `|` / `-`: split panes (33%)
- `h/j/k/l`: vim-style pane navigation
- Plugins: catppuccin, vim-tmux-navigator, resurrect, continuum

### Naming

- Lowercase, hyphenated for new dirs
- Dotfiles at root level for direct home symlinks

## ANTI-PATTERNS

| Pattern | Why |
|---------|-----|
| Commit `.localProfile` | Contains secrets |
| Hardcoded paths with username | Use `$HOME` |
| `git push -f` | Use `--force-with-lease` |
| Secrets in shell history | Use vault functions |

## BOOTSTRAP

```bash
git clone git@github.com:third774/dotfiles.git ~/.dotfiles
cd ~/.dotfiles/script && ./setup
```

Setup does:
1. Creates `~/.gitconfig.local` (prompts for email)
2. Installs oh-my-zsh
3. Copies `.zshrc`, `.vimrc` to home
4. Creates symlinks: karabiner, raycast, lazygit, ghostty, alacritty, opencode, .claude
5. Installs TPM (tmux plugins)
6. Runs `brew bundle`

## COMMANDS

```bash
# Reload shell
resource

# Git: fuzzy branch checkout
gch          # all branches
grecent      # sorted by recency

# Git: interactive conventional commit
commit

# Notify on command completion
long-running-command; fin
```

## TOOLS (via Brewfile)

**CLI:** ast-grep, bat, eza, fd, fzf, gum, jq, ripgrep, yazi, zoxide
**Dev:** jj, nvm, tmux, sesh, lumen
**Apps:** 1Password, Alacritty, Karabiner, VS Code, Firefox, Chrome

## NOTES

- NVM auto-switches on `cd` via `.nvmrc` detection
- Zoxide (`z`) replaces `cd` for frecency-based navigation
- `fin` shows Raycast confetti + audio on command success/failure
- Karabiner config is generated from TypeScript (`karabiner/*.ts`)
