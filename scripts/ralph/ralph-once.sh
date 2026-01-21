#!/usr/bin/env bash
# ralph-once.sh - Single iteration Ralph Wiggum for HITL (human-in-the-loop) mode
# https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum

set -euo pipefail

# Defaults
PRD_FILE="prd.json"
PROGRESS_FILE="progress.txt"
FEEDBACK_PATH=""
MODEL=""

usage() {
  cat <<EOF
Usage: ralph-once [options]

Run a single Ralph iteration (HITL mode).

Options:
  --prd <file>       PRD file (default: prd.json)
  --progress <file>  Progress file (default: progress.txt)
  --feedback <path>  Feedback loop instructions (scripts dir or .md file)
  --model <model>    Model in provider/model format
  -h, --help         Show this help
EOF
  exit 0
}

# Parse arguments
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

# Validate PRD file exists and is valid JSON
if [[ ! -f "$PRD_FILE" ]]; then
  echo "Error: PRD file not found: $PRD_FILE"
  exit 1
fi

if ! jq empty "$PRD_FILE" 2>/dev/null; then
  echo "Error: PRD file is not valid JSON: $PRD_FILE"
  exit 1
fi

# Build feedback instruction if provided
FEEDBACK_INSTRUCTION=""
if [[ -n "$FEEDBACK_PATH" ]]; then
  if [[ -e "$FEEDBACK_PATH" ]]; then
    FEEDBACK_INSTRUCTION="Additionally, see $FEEDBACK_PATH for feedback loop instructions."
  else
    echo "Warning: Feedback path not found: $FEEDBACK_PATH"
  fi
fi

# Build the prompt
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

# Build opencode command
CMD=(opencode run "$PROMPT")
if [[ -n "$MODEL" ]]; then
  CMD+=(--model "$MODEL")
fi

# Run opencode
echo "Running Ralph iteration..."
"${CMD[@]}"
RESULT=$?

# Validate PRD is still valid JSON after run
if ! jq empty "$PRD_FILE" 2>/dev/null; then
  echo "Warning: ${PRD_FILE} is malformed after run, restoring from git"
  git checkout -- "$PRD_FILE" 2>/dev/null || echo "Could not restore from git"
fi

# Notify completion
fin

exit $RESULT
