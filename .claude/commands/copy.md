# /copy

Copy $ARGUMENTS to clipboard using pbcopy.

## Usage

```
/copy [content]
```

If no content is provided, copies the current selection or specified text to clipboard.

## Implementation

Copy the provided arguments to the clipboard using pbcopy command.

```bash
echo "$@" | pbcopy
```