# Dotfiles Repository

macOS dotfiles for shell, terminal, editor, and agent tools.

## Where to look

| Task | Location |
|------|----------|
| Add a shell alias | `.aliases` |
| Add a shell function | `utils.sh` |
| Add a PATH entry | `.path` |
| Set machine-specific values | `.localProfile` |
| Change the default OpenCode model | `.localProfile` (`OPENCODE_MODEL`) |
| Add machine-specific OpenCode config (such as work-only plugins) | `opencode/opencode.json` (see [Machine-specific OpenCode config](#machine-specific-opencode-config)) |
| Add a Homebrew package | `Brewfile` |
| Change Git settings | `git/gitconfig` |
| Change tmux settings | `.tmux.conf` |
| Change agent config | `opencode/` or `pi/` |
| Change machine setup | `script/setup` |

## Rules

- Keep changes small and follow the existing structure.
- Keep `script/setup` in sync when you add packages, config directories, symlinks, plugins, or machine requirements. It is the source of truth for a fresh setup.
- Make every setup step idempotent. It must be safe to run `script/setup` more than once. Guard installs, use `ln -sfn` for symlinks, and check before appending config.
- Never commit `.localProfile`. Keep secrets and machine-specific values there.
- Use `$HOME` instead of hardcoded home-directory paths.
- Keep shell aliases in `.aliases` and functions in `utils.sh`.
- When a force push is needed, use `--force-with-lease`; never use `git push -f`.
- Use `karabiner/*.ts` as the source for generated Karabiner config.

## Machine-specific OpenCode config

This repo syncs between a personal and a work computer. Keep shared OpenCode config in `opencode/opencode.jsonc`. Put config for one machine only in `opencode/opencode.json`. The root `.gitignore` ignores that file, so never commit it.

Use `opencode/opencode.json` when a plugin, MCP server, or other source is available only on one machine. For example, it comes from a private or company source control host, a private package registry, or an internal network. The other machine cannot get to these sources. If you are not sure whether a source is public, use `opencode/opencode.json`.

- OpenCode loads both files from `~/.config/opencode` (a symlink to `opencode/`). It reads `opencode.json` first, then `opencode.jsonc`.
- `plugins` arrays from both files are combined.
- For other settings that are in both files, the value in `opencode.jsonc` is used. To override a shared setting on one machine, use an `{env:...}` value in `opencode.jsonc` and set the variable in `.localProfile`.
- Run `opencode debug config` to see the files that OpenCode loaded, and `opencode plugin list` to see the loaded plugins.
- The OpenCode docs do not say that both files load. This was verified in OpenCode v2.2.5. After an update, verify it again with `opencode debug config`.
