#!/bin/bash

# Claude Code Notification Hook
# Sends macOS notifications for various Claude Code events

# Read JSON input from stdin
input=$(cat)

# Debug: Log the input to see what Claude Code is sending
echo "[$(date)] Hook triggered with input: $input" >> /tmp/claude-hook-debug.log

# Get the hook event name from the JSON input
hook_event=$(echo "$input" | jq -r '.hook_event_name // "unknown"')
echo "[$(date)] Hook event: $hook_event" >> /tmp/claude-hook-debug.log

# Handle different hook events
case "$hook_event" in
"Notification")
  # Parse the message to determine notification type
  message=$(echo "$input" | jq -r '.message // ""')
  
  if [[ "$message" == *"Claude needs your permission to use"* ]]; then
    # Permission request notification - extract tool name
    tool=$(echo "$message" | sed 's/Claude needs your permission to use //')
    osascript -e "display notification \"Permission needed for: $tool\" with title \"Claude Code\" sound name \"Hero\""
  elif [[ "$message" == *"Claude is waiting for your input"* ]]; then
    # Idle notification
    osascript -e "display notification \"Claude is waiting for your input\" with title \"Claude Code Idle\" sound name \"Purr\""
  else
    # Other notification types
    osascript -e "display notification \"$message\" with title \"Claude Code\" sound name \"Tink\""
  fi
  ;;

"Stop")
  # Task completion notification
  osascript -e "display notification \"Task completed successfully\" with title \"Claude Code Complete\" sound name \"Glass\""
  ;;

"SubagentStop")
  # Subagent completion notification
  agent_type=$(echo "$input" | jq -r '.agentType // "unknown"')
  osascript -e "display notification \"Subagent completed: $agent_type\" with title \"Claude Code Subagent\" sound name \"Tink\""
  ;;

*)
  # Unknown event - log it for debugging
  osascript -e "display notification \"Hook event: $hook_event\" with title \"Claude Code Hook\" sound name \"Pop\""
  ;;
esac

# Always exit 0 to allow Claude to continue
exit 0

