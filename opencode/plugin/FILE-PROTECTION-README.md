# OpenCode File Protection Plugin

Prevents OpenCode AI from accessing sensitive files like environment variables, SSH keys, cloud credentials, and database credentials.

## Overview

This plugin intercepts file access operations before they execute and blocks access to sensitive files. When OpenCode attempts to read a protected file, it receives a clear error message instructing the user to manually inspect the file and provide necessary context.

## Features

- 🔒 **Blocks file reading operations** on sensitive files
- 🚫 **Prevents glob patterns** that target sensitive files
- 🛡️ **Protects multiple categories** of sensitive data
- ⚙️ **Fully configurable** via JSON configuration
- 💬 **User-friendly error messages** with guidance
- 🎯 **Exception support** for non-sensitive files (e.g., `.env.example`)

## Protected File Categories

### 1. Environment Files
- `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.staging`, `.env.test`
- `.envrc` (direnv files)
- `env.json`, `env.yaml`, `env.yml`
- `*.env` pattern files
- **Exceptions**: `.env.example`, `.env.sample`, `.env.template`

### 2. SSH Keys
- File extensions: `.pem`, `.key`, `.crt`, `.p12`, `.pfx`, `.jks`
- Filenames: `id_rsa`, `id_ed25519`, `id_ecdsa`, `id_dsa`, `known_hosts`, `authorized_keys`
- Directories: `.ssh/`

### 3. Cloud Credentials
- `.aws/credentials`, `.aws/config`
- `.azure/credentials`
- `.gcp/credentials.json`
- `.config/gcloud/credentials`
- `.kube/config`
- Directories: `.aws/`, `.azure/`, `.gcp/`, `.kube/`

### 4. Database Credentials
- `.pgpass`, `.my.cnf`, `.mysqlrc`
- `database.yml`, `database.json`
- Patterns: `**/config/database.*`

### 5. API Keys & Tokens
- Patterns: `**/*secret*`, `**/*password*`, `**/*token*`, `**/*credential*`, `**/*api-key*`, `**/*apikey*`, `**/*auth*`
- Filenames: `secrets.json`, `secrets.yaml`, `credentials.json`, `api-keys.json`
- Directories: `secrets/`, `credentials/`, `private/`

### 6. Other Sensitive Files
- `.netrc`, `.npmrc`, `.pypirc`, `.dockercfg`
- `.docker/config.json`
- `.gnupg/` directory

## Installation

The plugin is automatically loaded by OpenCode when placed in the `~/.config/opencode/plugin/` directory.

1. Ensure the plugin files are in place:
   ```
   ~/.config/opencode/plugin/
   ├── file-protection.ts
   ├── protection-patterns.json
   └── README.md
   ```

2. Install dependencies (if not already installed):
   ```bash
   cd ~/.config/opencode
   npm install
   # or
   bun install
   ```

3. Type-check the plugin:
   ```bash
   npm run check
   # or
   bun run check
   ```

4. The plugin will be automatically loaded the next time you start OpenCode

## Configuration

Edit `protection-patterns.json` to customize which files are protected:

```json
{
  "patterns": {
    "env_files": {
      "description": "Environment configuration files containing secrets",
      "enabled": true,
      "extensions": [".env", ".env.local"],
      "exceptions": [".env.example"]
    },
    "custom_category": {
      "description": "Your custom protection category",
      "enabled": true,
      "filenames": ["my-secret-file.txt"],
      "patterns": ["**/secrets/**"]
    }
  }
}
```

### Configuration Options

Each protection category supports:

- **`enabled`**: Boolean to enable/disable the category
- **`description`**: Human-readable description of why files are protected
- **`extensions`**: File extensions to protect (e.g., `[".env", ".key"]`)
- **`filenames`**: Exact filenames to protect (e.g., `["id_rsa", ".npmrc"]`)
- **`patterns`**: Glob patterns to match (e.g., `["**/*secret*", "*.env"]`)
- **`paths`**: Specific file paths to protect (e.g., `[".aws/credentials"]`)
- **`directories`**: Directory names to protect (e.g., `[".ssh", ".aws"]`)
- **`exceptions`**: Files to exclude from protection (e.g., `[".env.example"]`)

### Adding New Protection Patterns

To add protection for a new file type:

```json
{
  "patterns": {
    "my_custom_protection": {
      "description": "My custom sensitive files",
      "enabled": true,
      "extensions": [".secret"],
      "filenames": ["vault.txt"],
      "patterns": ["**/private/**"],
      "exceptions": ["public-vault.txt"]
    }
  }
}
```

### Disabling a Protection Category

Set `enabled: false` to temporarily disable a category:

```json
{
  "patterns": {
    "api_keys": {
      "enabled": false,
      "// ...": "..."
    }
  }
}
```

## How It Works

The plugin uses the `tool.execute.before` hook to intercept file operations:

1. **Read Tool**: Blocks direct file reading of protected files
2. **Glob Tool**: Blocks glob patterns that might target sensitive files
3. **Grep Tool**: Blocks content searches in protected paths
4. **List Tool**: Blocks directory listings of protected directories

When a protected file is accessed, OpenCode receives an error message like:

```
🔒 Access Denied: Cannot read '.env'

Reason: Environment configuration files containing secrets

This file contains sensitive information and has been blocked by file protection.

📋 To help me understand what you need:
1. Manually inspect the file yourself
2. Tell me what specific information you need from it (without sharing secrets)
3. I can help you work with the information once you provide context

Alternatively, if this file should not be protected, you can update the protection patterns in:
~/.config/opencode/plugin/protection-patterns.json
```

## Workflow Example

**User**: "Read the .env file and tell me what database we're using"

**OpenCode** (receives error):
```
🔒 Access Denied: Cannot read '.env'
Reason: Environment configuration files containing secrets
```

**OpenCode**: "I cannot read the .env file directly as it's protected. Could you manually check the file and tell me which database is configured? Look for variables like DATABASE_URL or DB_HOST."

**User**: "It's PostgreSQL"

**OpenCode**: "Great! I can help you work with PostgreSQL. What would you like to do?"

## Testing

Test the plugin by attempting to read a protected file:

```bash
# Start OpenCode
opencode

# Try to read a protected file (should be blocked)
"Read my .env file"
```

You should see the protection error message.

## Troubleshooting

### Plugin not loading
- Check that the file is in `~/.config/opencode/plugin/` or `.opencode/plugin/`
- Run `npm run check` to verify TypeScript compilation
- Check console logs when OpenCode starts

### File not being protected
- Verify the pattern matches in `protection-patterns.json`
- Check that the category is `enabled: true`
- Ensure the file path matches one of the patterns
- Check if the file is listed in `exceptions`

### False positives
- Add the file to the `exceptions` array in the relevant category
- Or disable the category temporarily with `enabled: false`

## Development

### Type Checking
```bash
npm run check
# or
bun run check
```

### Testing Changes
After modifying the plugin or patterns:
1. Save your changes
2. Restart OpenCode
3. Try accessing a protected file to verify

### Adding Debug Logging
The plugin logs protection events to the console:
```
[FileProtection] Protection patterns loaded successfully
[FileProtection] Plugin initialized for project: my-project
[FileProtection] Blocked read access to: .env (env_files)
```

## Security Notes

- This plugin provides **defense-in-depth** but is not a replacement for proper file permissions
- Always use proper OS-level file permissions for sensitive files (e.g., `chmod 600 ~/.ssh/id_rsa`)
- The plugin blocks OpenCode from reading files, but doesn't prevent other applications
- Review your `.gitignore` to ensure sensitive files aren't committed to version control

## License

This plugin is part of your personal dotfiles configuration.

## Contributing

To improve this plugin:
1. Edit `file-protection.ts` for logic changes
2. Edit `protection-patterns.json` for pattern changes
3. Run `npm run check` to verify TypeScript
4. Test thoroughly before committing

## Support

For issues or questions:
- Review the OpenCode plugin documentation: https://opencode.ai/docs/plugins/
- Check the protection patterns configuration
- Review console logs for error messages
