# Dotfiles Repository

macOS dotfiles for shell, terminal, editor, and agent tools.

## Where to look

| Task | Location |
|------|----------|
| Add a shell alias | `.aliases` |
| Add a shell function | `utils.sh` |
| Add a PATH entry | `.path` |
| Set machine-specific values | `.localProfile` |
| Add a Homebrew package | `Brewfile` |
| Change Git settings | `git/gitconfig` |
| Change tmux settings | `.tmux.conf` |
| Change agent config | `opencode/` or `pi/` |
| Change machine setup | `script/setup` |

## Rules

- Keep changes small and follow the existing structure.
- Keep `script/setup` in sync when you add packages, config directories, symlinks, plugins, or machine requirements. It is the source of truth for a fresh setup.
- Make setup steps safe to run more than once. Guard installs, use `ln -sfn` for symlinks, and check before appending config.
- Never commit `.localProfile`. Keep secrets and machine-specific values there.
- Use `$HOME` instead of hardcoded home-directory paths.
- Keep shell aliases in `.aliases` and functions in `utils.sh`.
- When a force push is needed, use `--force-with-lease`; never use `git push -f`.
- Use `karabiner/*.ts` as the source for generated Karabiner config.
