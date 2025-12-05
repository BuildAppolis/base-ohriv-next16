#!/bin/bash

# Terminal prompt integration for automatic file change display
# Add this to your .bashrc or .zshrc for automatic change detection

CHANGE_LOG="$PWD/.claude/changes.log"

# Function to show recent file changes
show_recent_changes() {
  if [ -f "$CHANGE_LOG" ] && [ -s "$CHANGE_LOG" ]; then
    # Get changes in the last 2 minutes
    recent_changes=$(tail -10 "$CHANGE_LOG" 2>/dev/null | grep -v "^#" | grep "\[[0-9]\{2\}:[0-9]\{2\}:[0-9]\{2\}\]" 2>/dev/null)

    if [ ! -z "$recent_changes" ]; then
      echo -e "\n\033[90m📁 Recent changes:\033[0m"
      echo "$recent_changes" | head -3 | while read line; do
        echo -e "\033[90m  $line\033[0m"
      done
    fi
  fi
}

# Export function for use in prompt
export -f show_recent_changes

# Bash prompt integration example:
# Add this to your .bashrc:
# PS1='$(show_recent_changes)\n'$PS1

# Zsh prompt integration example:
# Add this to your .zshrc:
# precmd() { show_recent_changes; }