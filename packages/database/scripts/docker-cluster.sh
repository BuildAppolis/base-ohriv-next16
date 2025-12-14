#!/bin/bash

# Cluster Docker script for RavenDB (Development Testing)
# Usage: ./scripts/docker-cluster.sh [start|stop|logs|restart|clean]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/docker"

ACTION=${1:-start}

case "$ACTION" in
  start)
    echo "🚀 Starting RavenDB 3-node cluster for development..."
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.cluster.dev.yml" up -d

    echo "📊 Cluster Status:"
    echo "  🟢 Node 1 (Primary): http://localhost:8080"
    echo "  🟡 Node 2 (Replica): http://localhost:8081"
    echo "  🟡 Node 3 (Replica): http://localhost:8082"
    echo ""
    echo "🔗 Client Connection URLs:"
    echo "  Primary: http://localhost:8080"
    echo "  Cluster: http://localhost:8080,http://localhost:8081,http://localhost:8082"
    echo ""
    echo "⚠️  Note: Configure replication in RavenDB Studio after startup"
    echo "    Navigate to: Databases → Create Database → Enable Replication"
    ;;
  stop)
    echo "⏹️ Stopping RavenDB cluster containers..."
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.cluster.dev.yml" down
    echo "✅ RavenDB cluster stopped"
    ;;
  logs)
    NODE=${2:-1}
    if [[ "$NODE" =~ ^[1-3]$ ]]; then
      echo "📋 RavenDB Node $NODE logs:"
      cd "$PROJECT_DIR"
      docker-compose -f "$DOCKER_DIR/docker-compose.cluster.dev.yml" logs -f raven-node-$NODE
    else
      echo "📋 RavenDB cluster logs:"
      cd "$PROJECT_DIR"
      docker-compose -f "$DOCKER_DIR/docker-compose.cluster.dev.yml" logs -f
    fi
    ;;
  restart)
    echo "🔄 Restarting RavenDB cluster..."
    "$0" stop
    sleep 3
    "$0" start
    ;;
  status)
    echo "📊 RavenDB cluster status:"
    docker ps --filter "name=raven-node" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🔍 Checking cluster health..."
    for port in 8080 8081 8082; do
      if curl -s "http://localhost:$port" >/dev/null 2>&1; then
        echo "  ✅ Node on port $port: Healthy"
      else
        echo "  ❌ Node on port $port: Unhealthy"
      fi
    done
    ;;
  clean)
    echo "🧹 Cleaning up RavenDB cluster resources..."
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.cluster.dev.yml" down -v
    docker volume rm \
      ohriv-optimized_raven-data-1 \
      ohriv-optimized_raven-data-2 \
      ohriv-optimized_raven-data-3 \
      2>/dev/null || true
    echo "✅ Cluster cleanup complete"
    ;;
  init-cluster)
    echo "🔧 Initializing RavenDB cluster replication..."
    echo "⚠️  Manual setup required:"
    echo ""
    echo "1. Open http://localhost:8080 in your browser"
    echo "2. Create a new database (e.g., 'tenant-test')"
    echo "3. Go to: Databases → Your Database → Settings → Replication & Sharding"
    echo "4. Set Replication Factor to 3"
    echo "5. Select all nodes (raven-node-1, raven-node-2, raven-node-3)"
    echo "6. Click 'Save'"
    echo ""
    echo "📖 For automation examples, see: docs/cluster-setup.md"
    ;;
  *)
    echo "Usage: $0 {start|stop|logs [node]|restart|status|clean|init-cluster}"
    echo ""
    echo "Commands:"
    echo "  start        - Start 3-node development cluster"
    echo "  stop         - Stop cluster containers"
    echo "  logs [1-3]   - Show logs for specific node or all nodes"
    echo "  restart      - Restart cluster"
    echo "  status       - Show cluster status and health"
    echo "  clean        - Remove containers and volumes"
    echo "  init-cluster - Show cluster initialization instructions"
    exit 1
    ;;
esac