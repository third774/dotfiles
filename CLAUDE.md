# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal dotfiles repository for macOS development environment setup. It contains shell configurations, application settings, and automation scripts for setting up a productive development environment.

## Setup and Installation

Initial setup (only run once):

```bash
cd ~/.dotfiles/script/
./setup
```

The setup script will:

- Configure git with shared and local configurations
- Install oh-my-zsh
- Create symlinks for configuration files (karabiner, raycast, lazygit, etc.)
- Install system dependencies via Homebrew Bundle

## Key Commands and Utilities

### Package Management

```bash
brew bundle  # Install all dependencies from Brewfile
```

### Custom Shell Functions (from utils.sh)

```bash
# Git workflow helpers
gch         # Checkout branch using fzf
gs          # Stage files using fzf selection
grecent     # Switch to recent branch using fzf
gu <branch> # Update branch and return to current
commit      # Interactive conventional commit with gum
gar         # Add remote from clipboard URL

# Utility functions
fin         # Success/failure notification with voice and confetti
t <path>    # Create file and parent directories
resource    # Reload zsh configuration
```

### Aliases (from .aliases)

```bash
# Git shortcuts
gaa     # Stage all changed files
gca     # Amend commit (no verify)
gcan    # Amend commit (no verify, no edit)
gcm     # Commit with message
gfph    # Force push with lease
gp      # Push and set upstream
grs1    # Soft reset last commit

# General utilities
lg      # Launch lazygit
y       # Launch yazi file manager
cdgr    # cd to git root
scripts # Show package.json scripts with jq
```

## Architecture and Structure

### Configuration Loading Chain

1. `.zshrc` → `.entry-point`
2. `.entry-point` sources in order:
   - `.path` (PATH modifications)
   - `.p10k.zsh` (Powerlevel10k theme)
   - `.zsh` (oh-my-zsh and plugins)
   - `.nvm-setup` (Node version manager)
   - `.aliases` (command aliases)
   - `.localProfile` (local overrides)
   - `utils.sh` (custom functions)

### Git Configuration

- Global git config: `git/gitconfig`
- Local user config: `~/.gitconfig.local` (created by setup script)
- Global gitignore: `git/gitignore_global`
- Git hooks: `git-hooks/pre-commit`

### Application Configurations

- **Karabiner Elements**: `karabiner/` (keyboard customization)
- **Raycast**: `raycast/` (productivity launcher)
- **Lazygit**: `lazygit/config.yml`
- **Ghostty**: `ghostty/` (terminal emulator)
- **tmux**: `.tmux.conf`

### Claude Code Hooks
The `.claude/` directory contains TypeScript hooks for notifications and file protection:

#### Development Commands
```bash
cd .claude && npm run check    # Type check all hooks
cd .claude && npm run format   # Format all hooks with prettier
```

#### Hook Architecture
Hooks are written in TypeScript and use shared utilities:

```
.claude/
├── src/
│   ├── notification-hook.ts           # System notifications
│   ├── stop-hook.ts                   # Session stop handling  
│   ├── subagent-stop-hook.ts         # Subagent cleanup
│   ├── file-protection-hook.ts       # File access protection
│   ├── config/
│   │   └── protected-patterns.json   # Protection patterns
│   └── shared/                       # Common utilities
│       ├── input.ts                  # Hook input parsing
│       ├── types.ts                  # TypeScript interfaces
│       ├── logger.ts                 # Logging utilities
│       └── notifications.ts          # macOS notifications
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
└── settings.json                     # Hook registration
```

#### Creating New Hooks
1. **Create TypeScript file** in `src/` directory
2. **Import shared utilities**:
   ```typescript
   import { readInput, parseHookEvent } from "./shared/input.js";
   import { logMessage } from "./shared/logger.js";
   import { HookEvent } from "./shared/types.js";
   ```
3. **Implement hook logic** with proper error handling
4. **Register in settings.json**:
   ```json
   {
     "hooks": {
       "PreToolUse": [
         {
           "matcher": "Read|Write",
           "hooks": [
             {
               "type": "command", 
               "command": "npx tsx ~/.dotfiles/.claude/src/your-hook.ts"
             }
           ]
         }
       ]
     }
   }
   ```

#### File Protection System
Prevents Claude from accessing sensitive files through a PreToolUse hook:

**Protected file types:**
- Environment files (`.env*`)
- SSH keys and certificates (`.ssh/`, `*.pem`, `*.key`)
- API tokens and credentials (files containing `*secret*`, `*password*`, `*token*`)
- Cloud config files (`.aws/`, `.docker/config.json`)

**Adding new protection patterns:**
Edit `src/config/protected-patterns.json`:
```json
{
  "fileExtensions": [".env", ".pem", ".key"],
  "filePaths": [".ssh/", ".aws/credentials"], 
  "filenamePatterns": ["*secret*", "*password*"],
  "directoryPatterns": [".ssh", ".aws"],
  "customPatterns": ["vault.txt"]
}
```

The hook automatically blocks `Read`, `Glob`, and `Grep` operations on protected files.

## Development Tools

### Installed via Homebrew

- **Shell**: zsh with oh-my-zsh, powerlevel10k, fzf
- **Git**: git-split-diffs for enhanced diff viewing
- **File management**: eza, yazi, fd, ripgrep
- **Development**: nvim (default editor), gum (interactive prompts)
- **Terminal multiplexing**: tmux with tpm plugin manager

### Key Integrations

- fzf integration for fuzzy finding in git commands
- zoxide for smart directory jumping
- NVM for Node.js version management
- Oh-my-zsh plugins: aws, kubectl, git, docker, node, npm, fzf

## Common Development Workflows

### Git Workflow

1. Use `gs` to interactively stage files
2. Use `commit` for conventional commits with interactive prompts
3. Use `gp` to push and set upstream tracking
4. Use `gch` or `grecent` for branch switching

### Terminal Enhancement

- Use `y` (yazi) for file management
- Use `lg` (lazygit) for git operations
- Use `cdgr` to quickly navigate to git repository root
- Use `fin` after long-running commands for audio/visual feedback

