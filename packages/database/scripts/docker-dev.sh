#!/bin/bash

# Development Docker script for RavenDB
# Usage: ./scripts/docker-dev.sh [start|stop|logs|restart]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/docker"

ACTION=${1:-start}

case "$ACTION" in
  start)
    echo "🚀 Starting RavenDB in development mode..."
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" up -d
    echo "✅ RavenDB Studio available at: http://localhost:8080"
    echo "🔗 Client connection URL: http://localhost:8080"
    ;;
  stop)
    echo "⏹️ Stopping RavenDB development container..."
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" down
    echo "✅ RavenDB stopped"
    ;;
  logs)
    echo "📋 RavenDB development logs:"
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" logs -f
    ;;
  restart)
    echo "🔄 Restarting RavenDB..."
    "$0" stop
    sleep 2
    "$0" start
    ;;
  status)
    echo "📊 RavenDB container status:"
    docker ps --filter "name=raven-db-dev" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    ;;
  clean)
    echo "🧹 Cleaning up RavenDB development resources..."
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.dev.yml" down -v
    docker volume rm ohriv-optimized_raven-dev-data 2>/dev/null || true
    echo "✅ Cleanup complete"
    ;;
  *)
    echo "Usage: $0 {start|stop|logs|restart|status|clean}"
    echo ""
    echo "Commands:"
    echo "  start   - Start RavenDB in development mode"
    echo "  stop    - Stop RavenDB development container"
    echo "  logs    - Show RavenDB logs"
    echo "  restart - Restart RavenDB"
    echo "  status  - Show container status"
    echo "  clean   - Remove containers and volumes"
    exit 1
    ;;
esac