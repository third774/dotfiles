---
name: cf
description: Use the Cloudflare cf CLI for Cloudflare operations.
metadata:
  opencode/autoinvoke: false
---

# cf

Use this skill only when the user explicitly requests `@cf`.

`cf` is a beta CLI generated from Cloudflare's public OpenAPI surface. Its
command surface can change. Do not rely on memorized commands or enumerate its
capabilities.

## Discover commands

Use CLI help to discover only the command needed for the user's task:

```sh
cf --help
cf <product> --help
cf <product> <group> --help
cf <product> <group> <operation> --help
```

Use shell completion when it helps command discovery. Read the selected
operation's help before running it.

## Authentication

`cf` uses `CLOUDFLARE_API_TOKEN` when it is configured, or an OAuth profile.
Never ask the user to paste a token into chat. Use `cf auth login` only when
interactive authentication is appropriate.

Use `--profile <name>` only when the user identifies the required profile.

## Safe operation

1. Prefer read-only operations first. Discover resource identifiers and
   required parameters before a write operation.
2. Before a command that creates, updates, deletes, deploys, or changes live
   Cloudflare resources, show the exact command, name the affected account,
   zone, project, or resource, and request confirmation.
3. Do not run `cf deploy` without explicit confirmation.
4. For project commands such as `cf init`, `cf dev`, `cf build`, or `cf deploy`,
   inspect the repository before you run the command.
5. Use `--local` only when the selected command's help confirms support for it.
6. Do not expose credentials or sensitive command output. Use `jq` to reduce
   JSON output when this is useful.
