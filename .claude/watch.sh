#!/bin/bash
# Quick watcher script for development

echo "🔍 Available watcher options:"
echo "1. pnpm watch     - Watch all code files"
echo "2. pnpm watch:src  - Watch src files only"
echo "3. pnpm watch:all  - Watch everything"
echo "4. pnpm watch:simple - Simple output watcher"
echo ""

# Default to src files if no argument provided
WATCHER_TYPE=${1:-src}

case $WATCHER_TYPE in
  "all")
    echo "Starting watcher for ALL files..."
    pnpm watch:all
    ;;
  "simple")
    echo "Starting simple watcher..."
    pnpm watch:simple
    ;;
  *)
    echo "Starting watcher for SRC files..."
    pnpm watch:src
    ;;
esac