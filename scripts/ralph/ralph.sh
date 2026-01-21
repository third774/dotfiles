#!/usr/bin/env bash
# ralph.sh - Loop-mode Ralph Wiggum for AFK autonomous coding
# https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="prd.json"
ITERATIONS=""
PASSTHROUGH_ARGS=()

usage() {
  cat <<EOF
Usage: ralph <iterations> [options]

Run Ralph in a loop for AFK autonomous coding.

Arguments:
  iterations         Number of iterations to run (required)

Options:
  --prd <file>       PRD file (default: prd.json)
  --progress <file>  Progress file (default: progress.txt)
  --feedback <path>  Feedback loop instructions (scripts dir or .md file)
  --model <model>    Model in provider/model format
  -h, --help         Show this help

All options are passed through to ralph-once.
EOF
  exit 0
}

if [[ $# -eq 0 ]]; then
  usage
fi

if [[ "$1" =~ ^[0-9]+$ ]]; then
  ITERATIONS="$1"
  shift
elif [[ "$1" == "-h" || "$1" == "--help" ]]; then
  usage
else
  echo "Error: First argument must be number of iterations"
  usage
fi

while [[ $# -gt 0 ]]; do
  case $1 in
    --prd)
      PRD_FILE="$2"
      PASSTHROUGH_ARGS+=("$1" "$2")
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      PASSTHROUGH_ARGS+=("$1")
      shift
      ;;
  esac
done

print_skipped_summary() {
  local skipped
  skipped=$(jq -r '.[] | select(.skipped) | "- \(.description): \(.skipped)"' "$PRD_FILE" 2>/dev/null)
  if [[ -n "$skipped" ]]; then
    echo ""
    echo "Skipped items (require human input):"
    echo "$skipped"
  fi
}

echo "Starting Ralph loop: $ITERATIONS iterations"
echo "---"

for ((i=1; i<=ITERATIONS; i++)); do
  echo "Iteration $i/$ITERATIONS"
  
  RESULT=$("$SCRIPT_DIR/ralph-once.sh" "${PASSTHROUGH_ARGS[@]}" 2>&1) || true
  echo "$RESULT"
  
  if [[ "$RESULT" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "---"
    echo "PRD complete after $i iterations"
    print_skipped_summary
    exit 0
  fi
  
  echo "---"
done

echo "Completed $ITERATIONS iterations"
print_skipped_summary
