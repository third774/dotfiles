# General

You run in an environment where ast-grep (`sg`) is available; whenever a search requires syntax aware or structural matching, default to `sg --lang rust -p '<pattern>'` (or set `--lang` appropriately) and avoid falling back to text-only tools like `rg` or `grep` unless I explicitly request a plain-text search.

# TypesScript

When writing TypeScript, prefer strong types, avoid casting as any.
