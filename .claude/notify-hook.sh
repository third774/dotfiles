#!/bin/bash

# Claude Code Notification Hook
# Sends macOS notifications for various Claude Code events
#
# Note: This script receives JSON input from Claude Code. JSON escape sequences
# like \n (newline), \t (tab), \b (backspace) are processed by jq during parsing.
# To include a literal backslash in messages, Claude Code should send \\\\ in JSON.

# Setup secure log directory
LOG_DIR="$HOME/Library/Logs/ClaudeCode"
LOG_FILE="$LOG_DIR/notify-hook.log"

# Enable debug mode if DEBUG env var is set
DEBUG="${DEBUG:-0}"

# Create log directory with proper permissions if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
    chmod 700 "$LOG_DIR"
fi

# Function to log messages
log_message() {
    local level="$1"
    local message="$2"
    # Sanitize log message (remove control characters)
    message=$(printf '%s' "$message" | tr -d '\000-\037' | head -c 1000)
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] [$level] $message" >> "$LOG_FILE"
}

# Function to debug log (only if DEBUG is enabled)
debug_log() {
    if [ "$DEBUG" = "1" ]; then
        log_message "DEBUG" "$1"
    fi
}

# Function to safely escape strings for AppleScript
escape_applescript() {
    local input="$1"
    # Remove any control characters first (including backspace from \b sequences)
    # This includes: null, bell, backspace, tab, newline, vertical tab, form feed, carriage return, etc.
    input=$(printf '%s' "$input" | tr -d '\000-\010\013-\037')
    # Keep tab (011) and newline (012) as they might be intentional
    
    # Then handle backslashes - must be done after control char removal
    input="${input//\\/\\\\}"
    # Then handle double quotes
    input="${input//\"/\\\"}"
    
    # Truncate to reasonable length
    if [ ${#input} -gt 200 ]; then
        input="${input:0:197}..."
    fi
    echo "$input"
}

# Function to send notification safely
send_notification() {
    local message="$1"
    local title="$2"
    local sound="${3:-Tink}"
    
    # Escape all parameters
    message=$(escape_applescript "$message")
    title=$(escape_applescript "$title")
    # Sound names don't need escaping as they're predefined
    
    debug_log "Sending notification: title='$title', message='$message', sound='$sound'"
    
    # Build and execute AppleScript command
    # Note: The escaping function already handles backslashes and quotes
    local script="display notification \"$message\" with title \"$title\" sound name \"$sound\""
    
    if ! osascript -e "$script" 2>/dev/null; then
        debug_log "Failed to send notification"
    fi
}

# Read JSON input from stdin (without timeout since it's not available on macOS)
input=""
if ! input=$(cat); then
    log_message "ERROR" "Failed to read input from stdin"
    exit 0
fi

# Log raw input in debug mode before any processing
debug_log "Raw input (first 200 chars): ${input:0:200}..."

# Validate input is not empty
if [ -z "$input" ]; then
    log_message "ERROR" "Empty input received"
    exit 0
fi

# Validate JSON and extract hook event name
hook_event=""
if ! hook_event=$(echo "$input" | jq -r '.hook_event_name // empty' 2>/dev/null); then
    log_message "ERROR" "Invalid JSON or missing hook_event_name"
    debug_log "Raw input that failed JSON parsing: $input"
    exit 0
fi

# Basic sanitization of hook_event
hook_event=$(echo "$hook_event" | tr -cd '[:alnum:]_-' | head -c 50)

log_message "INFO" "Hook event: $hook_event"

# Handle different hook events
case "$hook_event" in
"Notification")
    # Parse message from JSON
    message=""
    if message=$(echo "$input" | jq -r '.message // empty' 2>/dev/null) && [ -n "$message" ]; then
        # Basic sanitization
        message=$(printf '%s' "$message" | tr -d '\000-\037' | head -c 500)
        
        if [[ "$message" == *"Claude needs your permission to use"* ]]; then
            # Permission request notification
            # Extract tool name more safely
            tool="${message#*Claude needs your permission to use }"
            tool=$(echo "$tool" | sed 's/[^a-zA-Z0-9 ._-]//g' | head -c 100)
            send_notification "Permission needed for: $tool" "Claude Code" "Hero"
        elif [[ "$message" == *"Claude is waiting for your input"* ]]; then
            # Idle notification
            send_notification "Claude is waiting for your input" "Claude Code Idle" "Purr"
        else
            # Other notification types
            send_notification "$message" "Claude Code" "Tink"
        fi
    else
        log_message "WARNING" "No message in Notification event"
    fi
    ;;

"Stop")
    # Task completion notification
    send_notification "Task completed successfully" "Claude Code Complete" "Glass"
    ;;

"SubagentStop")
    # Subagent completion notification
    agent_type=""
    if agent_type=$(echo "$input" | jq -r '.agentType // empty' 2>/dev/null) && [ -n "$agent_type" ]; then
        # Sanitize agent type
        agent_type=$(echo "$agent_type" | sed 's/[^a-zA-Z0-9 ._-]//g' | head -c 50)
        send_notification "Subagent completed: $agent_type" "Claude Code Subagent" "Tink"
    else
        send_notification "Subagent completed" "Claude Code Subagent" "Tink"
    fi
    ;;

*)
    # Unknown event
    if [ -n "$hook_event" ]; then
        log_message "WARNING" "Unknown hook event: $hook_event"
        send_notification "Hook event: $hook_event" "Claude Code Hook" "Pop"
    fi
    ;;
esac

# Always exit 0 to allow Claude to continue
exit 0