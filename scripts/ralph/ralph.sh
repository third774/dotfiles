#!/usr/bin/env bash
# ralph.sh - Loop-mode Ralph Wiggum for AFK (away from keyboard) autonomous coding
# https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum

set -euo pipefail

PRD_FILE="prd.json"
PROGRESS_FILE="progress.txt"
FEEDBACK_PATH=""
MODEL=""
ITERATIONS=""

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
EOF
  exit 0
}

if [[ $# -eq 0 ]]; then
  usage
fi

# First positional arg is iterations
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
      shift 2
      ;;
    --progress)
      PROGRESS_FILE="$2"
      shift 2
      ;;
    --feedback)
      FEEDBACK_PATH="$2"
      shift 2
      ;;
    --model)
      MODEL="$2"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Unknown option: $1"
      usage
      ;;
  esac
done

if [[ ! -f "$PRD_FILE" ]]; then
  echo "Error: PRD file not found: $PRD_FILE"
  exit 1
fi

if ! jq empty "$PRD_FILE" 2>/dev/null; then
  echo "Error: PRD file is not valid JSON: $PRD_FILE"
  exit 1
fi

FEEDBACK_INSTRUCTION=""
if [[ -n "$FEEDBACK_PATH" ]]; then
  if [[ -e "$FEEDBACK_PATH" ]]; then
    FEEDBACK_INSTRUCTION="Additionally, see $FEEDBACK_PATH for feedback loop instructions."
  else
    echo "Warning: Feedback path not found: $FEEDBACK_PATH"
  fi
fi

read -r -d '' PROMPT <<EOF || true
@${PRD_FILE} @${PROGRESS_FILE}

You are Ralph. Work through the PRD one task at a time.

1. Read ${PRD_FILE}, find highest-priority item where "passes": false AND "skipped" is not set
   Priority order: architectural > integration > unknowns > features > polish

2. Discover feedback loops from package.json scripts (typecheck, test, lint, check, etc.)
   ${FEEDBACK_INSTRUCTION}

3. Implement the task

4. Run ALL discovered feedback loops. Fix any failures before proceeding.
   Do NOT commit if feedback loops fail.

5. Update ${PRD_FILE} for the item:
   - If completed successfully: set "passes": true
   - If blocked and needs human input: set "skipped": "<reason why human input is needed>"

6. Append to ${PROGRESS_FILE}:
   - Task completed/skipped + PRD item reference
   - Key decisions made (or reason for skipping)
   - Files changed
   Keep entries concise.

7. Commit with a conventional commit message (skip commit if task was skipped)

RULES:
- Work on ONE task only
- Do NOT commit if any feedback loop fails
- If a task requires human decision or input you cannot provide, skip it with a reason
- If ALL items have "passes": true OR "skipped" set, output <promise>COMPLETE</promise>
EOF

CMD=(opencode run "$PROMPT")
if [[ -n "$MODEL" ]]; then
  CMD+=(--model "$MODEL")
fi

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
echo "PRD: $PRD_FILE | Progress: $PROGRESS_FILE"
echo "---"

for ((i=1; i<=ITERATIONS; i++)); do
  echo "Iteration $i/$ITERATIONS"
  
  RESULT=$("${CMD[@]}" 2>&1) || true
  echo "$RESULT"
  
  if ! jq empty "$PRD_FILE" 2>/dev/null; then
    echo "Warning: ${PRD_FILE} is malformed after iteration $i, restoring from git"
    git checkout -- "$PRD_FILE" 2>/dev/null || echo "Could not restore from git"
  fi
  
  if [[ "$RESULT" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "---"
    echo "PRD complete after $i iterations"
    print_skipped_summary
    fin
    exit 0
  fi
  
  echo "---"
done

echo "Completed $ITERATIONS iterations"
print_skipped_summary
fin
