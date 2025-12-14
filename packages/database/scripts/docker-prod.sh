#!/bin/bash

# Production Docker script for RavenDB
# Usage: ./scripts/docker-prod.sh [deploy|stop|logs|update|status]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/docker"

ACTION=${1:-deploy}

# Check if production environment variables are set
check_prod_env() {
  if [[ -z "$RAVENDB_PUBLIC_URL" || -z "$RAVENDB_SERVER_URL" ]]; then
    echo "❌ Production environment variables not set!"
    echo ""
    echo "Required environment variables:"
    echo "  RAVENDB_PUBLIC_URL  - Public URL (e.g., https://ravendb.yourdomain.com)"
    echo "  RAVENDB_SERVER_URL  - Server URL (e.g., https://ravendb.yourdomain.com)"
    echo ""
    echo "Optional environment variables:"
    echo "  RAVENDB_CERT_PATH    - Path to SSL certificate"
    echo "  RAVENDB_CERT_PASSWORD - Certificate password"
    echo "  RAVENDB_API_KEY      - API key for authentication"
    echo ""
    echo "Set these in your .env or export them before running this script."
    exit 1
  fi
}

case "$ACTION" in
  deploy)
    echo "🚀 Deploying RavenDB to production..."
    check_prod_env

    cd "$PROJECT_DIR"

    # Create production directories if they don't exist
    mkdir -p config/raven-db
    mkdir -p data/ravendb
    mkdir -p logs/ravendb

    echo "📋 Production Configuration:"
    echo "  🌐 Public URL: $RAVENDB_PUBLIC_URL"
    echo "  🔗 Server URL: $RAVENDB_SERVER_URL"
    echo "  📁 Data Directory: $(pwd)/data/ravendb"
    echo "  🔧 Config Directory: $(pwd)/config/raven-db"
    echo ""

    docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" up -d

    echo "✅ RavenDB deployed to production"
    echo "🔗 Studio URL: $RAVENDB_PUBLIC_URL"
    echo "⚠️  Make sure to:"
    echo "   1. Set up SSL certificates"
    echo "   2. Configure firewall rules"
    echo "   3. Set up monitoring and backups"
    echo "   4. Review security settings"
    ;;
  stop)
    echo "⏹️ Stopping RavenDB production containers..."
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" down
    echo "✅ RavenDB stopped"
    ;;
  logs)
    echo "📋 RavenDB production logs:"
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" logs -f
    ;;
  status)
    echo "📊 RavenDB production status:"
    docker ps --filter "name=ohriv-raven-db" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🔍 Health check..."
    if [[ -n "$RAVENDB_PUBLIC_URL" ]]; then
      if curl -s "$RAVENDB_PUBLIC_URL" >/dev/null 2>&1; then
        echo "  ✅ RavenDB is accessible at $RAVENDB_PUBLIC_URL"
      else
        echo "  ❌ RavenDB is not accessible at $RAVENDB_PUBLIC_URL"
      fi
    fi
    ;;
  update)
    echo "🔄 Updating RavenDB production deployment..."
    cd "$PROJECT_DIR"

    # Pull latest image
    docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" pull

    # Restart with new image
    docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" up -d --force-recreate

    echo "✅ RavenDB updated"
    ;;
  backup)
    BACKUP_DIR=${2:-"$(pwd)/backups/$(date +%Y%m%d_%H%M%S)"}
    echo "💾 Creating backup of RavenDB data..."

    mkdir -p "$BACKUP_DIR"

    # Stop container briefly for consistent backup
    cd "$PROJECT_DIR"
    docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" stop

    # Copy data
    cp -r data/ravendb/* "$BACKUP_DIR/"

    # Restart
    docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" start

    echo "✅ Backup completed: $BACKUP_DIR"
    echo "📊 Backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"
    ;;
  clean)
    echo "🧹 Cleaning up production resources..."
    read -p "⚠️  This will delete ALL production data. Are you sure? (yes/no): " -r
    if [[ $REPLY =~ ^yes$ ]]; then
      cd "$PROJECT_DIR"
      docker-compose -f "$DOCKER_DIR/docker-compose.prod.yml" down -v
      docker volume rm ohriv-optimized_raven-data 2>/dev/null || true
      echo "✅ Production cleanup complete"
    else
      echo "❌ Cleanup cancelled"
    fi
    ;;
  *)
    echo "Usage: $0 {deploy|stop|logs|status|update|backup [dir]|clean}"
    echo ""
    echo "Commands:"
    echo "  deploy         - Deploy RavenDB to production"
    echo "  stop          - Stop production containers"
    echo "  logs          - Show production logs"
    echo "  status        - Show production status and health"
    echo "  update        - Update to latest RavenDB version"
    echo "  backup [dir]  - Create backup of RavenDB data"
    echo "  clean         - Remove containers and volumes (⚠️  destructive)"
    echo ""
    echo "Environment variables required:"
    echo "  RAVENDB_PUBLIC_URL  - Public URL for RavenDB"
    echo "  RAVENDB_SERVER_URL  - Server URL for RavenDB"
    exit 1
    ;;
esac