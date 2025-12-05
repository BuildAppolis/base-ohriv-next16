#!/bin/bash

# Auto file-change detector - runs in background and logs changes
# This creates a persistent log that can be displayed in your prompt

LOG_FILE="$PWD/.claude/changes.log"
PID_FILE="$PWD/.claude/autowatch.pid"

start_autowatch() {
  if [ -f "$PID_FILE" ]; then
    echo "Auto watcher already running (PID: $(cat $PID_FILE))"
    return 0
  fi

  echo "🔍 Starting automatic file change detection..."
  echo "Log file: $LOG_FILE"
  echo "PID file: $PID_FILE"

  # Create log file with timestamp
  echo "# Auto-watcher started at $(date)" > "$LOG_FILE"

  # Start background watcher process
  (
    npx chokidar 'src/**/*.{ts,tsx,js,jsx,json,css,md}' --initial=false --silent 2>/dev/null | while read event; do
      timestamp=$(date '+%H:%M:%S')
      echo "[$timestamp] $event" >> "$LOG_FILE"

      # Show change notification
      echo -e "\n📝 $event ($(date '+%H:%M:%S'))"
    done
  ) &

  echo $! > "$PID_FILE"
  echo "✅ Auto watcher started (PID: $(cat $PID_FILE))"
  echo "💡 Changes will be logged to: $LOG_FILE"
}

stop_autowatch() {
  if [ ! -f "$PID_FILE" ]; then
    echo "Auto watcher not running"
    return 1
  fi

  pid=$(cat "$PID_FILE")
  kill $pid 2>/dev/null
  rm -f "$PID_FILE"
  echo "🛑 Auto watcher stopped"
}

status_autowatch() {
  if [ -f "$PID_FILE" ]; then
    pid=$(cat "$PID_FILE")
    if ps -p $pid > /dev/null 2>&1; then
      echo "✅ Auto watcher running (PID: $pid)"
      if [ -f "$LOG_FILE" ]; then
        echo "Recent changes:"
        tail -5 "$LOG_FILE" | grep -v "^#" 2>/dev/null
      fi
    else
      echo "❌ Auto watcher not running (stale PID file)"
      rm -f "$PID_FILE"
    fi
  else
    echo "❌ Auto watcher not running"
  fi
}

case "$1" in
  start|s)
    start_autowatch
    ;;
  stop|q)
    stop_autowatch
    ;;
  status|st)
    status_autowatch
    ;;
  restart|r)
    stop_autowatch
    sleep 1
    start_autowatch
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart}"
    echo "  start     - Start auto watcher"
    echo "  stop      - Stop auto watcher"
    echo "  status    - Show status and recent changes"
    echo "  restart   - Restart auto watcher"
    ;;
esac