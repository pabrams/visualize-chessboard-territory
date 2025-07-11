#!/bin/bash

set -e

# Configuration
TIMER_FILE=".zip_timer_state"
TASK_FILE=".task_state.json"
REPO_OWNER="codemonkeyfromspace"
REPO_NAME="visualize-chessboard-territory"

# Helper: pretty format time
format_time() {
  local total_minutes=$1
  local h=$((total_minutes / 60))
  local m=$((total_minutes % 60))
  echo "${h}h ${m}m [${total_minutes}]"
}

# Timer helpers
start_timer() {
  local now=$(date +%s)
  if [[ -f $TIMER_FILE ]]; then
    jq \
      --argjson now "$now" \
      '.started_at = $now | .running = true' \
      "$TIMER_FILE" > "$TIMER_FILE.tmp" && mv "$TIMER_FILE.tmp" "$TIMER_FILE"
  else
    jq -n --argjson now "$now" '{started_at: $now, accumulated: 0, running: true}' > "$TIMER_FILE"
  fi
  echo "⏱️  Timer started."
}

pause_timer() {
  if [[ ! -f $TIMER_FILE ]]; then echo "Timer is not running."; exit 1; fi
  local now=$(date +%s)
  local started_at=$(jq -r '.started_at' $TIMER_FILE)
  local accumulated=$(jq -r '.accumulated' $TIMER_FILE)
  local new_acc=$((accumulated + now - started_at))
  jq --argjson newacc "$new_acc" '{started_at: now, accumulated: $newacc, running: false}' "$TIMER_FILE" > "$TIMER_FILE.tmp" && mv "$TIMER_FILE.tmp" "$TIMER_FILE"
  echo "⏸️  Timer paused."
}

get_total_minutes() {
  if [[ ! -f $TIMER_FILE ]]; then echo 0; return; fi
  local accumulated=$(jq -r '.accumulated' $TIMER_FILE)
  local running=$(jq -r '.running' $TIMER_FILE)
  local started_at=$(jq -r '.started_at' $TIMER_FILE)
  local now=$(date +%s)
  if [[ "$running" == "true" ]]; then
    echo $(((accumulated + now - started_at) / 60))
  else
    echo $((accumulated / 60))
  fi
}

show_timer_status() {
  if [[ ! -f $TIMER_FILE ]]; then echo "No timer state."; exit 0; fi
  local running=$(jq -r '.running' $TIMER_FILE)
  local total=$(get_total_minutes)
  echo "Timer is $running. Elapsed: $(format_time $total)"
}

# Parse --timer commands
if [[ "$1" == "--timer" ]]; then
  case "$2" in
    pause) pause_timer ;;
    resume) start_timer ;;
    status) show_timer_status ;;
    *) echo "Usage: $0 --timer [pause|resume|status]"; exit 1 ;;
  esac
  exit 0
fi

# Main logic
STAGE=$1
NOTIFY_EMAIL=$2
if [[ -z "$STAGE" ]]; then echo "Usage: $0 <stage> [notify@example.com]"; exit 1; fi
ZIPFILE="$STAGE.zip"

# Load or init task number
if [[ ! -f $TASK_FILE ]]; then
  echo '{"task_number": 1}' > "$TASK_FILE"
fi

TASK_NUM=$(jq -r '.task_number' "$TASK_FILE")
BRANCH_BASE_NAME=$(jq -r '.branch_base_name // empty' "$TASK_FILE")

if [[ -n "$BRANCH_BASE_NAME" ]]; then
  BRANCH_BASE="${BRANCH_BASE_NAME}-${TASK_NUM}-${STAGE}"
else
  BRANCH_BASE="${STAGE}-${TASK_NUM}"
fi
# Timer control based on stage
if [[ "$STAGE" == "start" ]]; then
  echo "Starting timer..."
  start_timer
  exit 0
elif [[ "$STAGE" == "rewrite" ]]; then
  echo "Checking timer..."
  if [[ ! -f $TIMER_FILE || $(jq -r '.running' $TIMER_FILE) != "true" ]]; then
    echo "❌ Timer is not running. Cannot complete 'rewrite'."
    exit 1
  fi
else
  # Other stages: must be running
  if [[ ! -f $TIMER_FILE || $(jq -r '.running' $TIMER_FILE) != "true" ]]; then
    echo "❌ Timer is not running. Run 'start' or resume it."
    exit 1
  fi
fi

# Git branch creation
BRANCH="$BRANCH_BASE"
i=1
while git show-ref --verify --quiet "refs/heads/$BRANCH" || git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null; do
  BRANCH="${BRANCH_BASE}-$i"
  ((i++))
done

echo "Creating branch $BRANCH..."
git checkout -b "$BRANCH"
git add .
git commit -m "$STAGE edits"
git push -u origin "$BRANCH"

# Create zip, exclude zips
zip -r "$ZIPFILE" . \
  -x "node_modules/*" "*/node_modules/*" \
  -x "dist/*" "*/dist/*" \
  -x "*.zip" \
  -x ".*" "*/.*"
echo "📦 Created $ZIPFILE"

# Stop timer and notify on rewrite
if [[ "$STAGE" == "rewrite" ]]; then
  pause_timer
  TOTAL_MIN=$(get_total_minutes)
  TIME_STR=$(format_time $TOTAL_MIN)
  echo "✔️  Total time: $TIME_STR"

  # Email notify
  if [[ -n "$NOTIFY_EMAIL" ]]; then
    SUBJECT="submitted $BRANCH ($TIME_STR)"
    LINK="https://github.com/$REPO_OWNER/$REPO_NAME/tree/$BRANCH"
    BODY="Branch: $BRANCH\nURL: $LINK\nTime spent: $TIME_STR"
    echo -e "$BODY" | mail -s "$SUBJECT" "$NOTIFY_EMAIL"
    echo "📧 Email sent to $NOTIFY_EMAIL"
  fi

  # Increment task number
  jq ".task_number += 1" "$TASK_FILE" > "$TASK_FILE.tmp" && mv "$TASK_FILE.tmp" "$TASK_FILE"
fi

echo "✅ Done with $STAGE."
