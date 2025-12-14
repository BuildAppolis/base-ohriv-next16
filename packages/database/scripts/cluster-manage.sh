#!/bin/bash

# Multi-VPS Cluster Management Script
# Usage: ./scripts/cluster-manage.sh [action] [options]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ANSIBLE_DIR="$PROJECT_DIR/deployment/ansible"
K8S_DIR="$PROJECT_DIR/deployment/kubernetes"

# Default configuration
DEPLOYMENT_METHOD=${DEPLOYMENT_METHOD:-"ansible"}  # ansible or kubernetes
ENVIRONMENT=${ENVIRONMENT:-"production"}
VAULT_PASSWORD_FILE="$HOME/.ravendb_vault_password"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    local method=$1

    case "$method" in
        "ansible")
            if ! command -v ansible &> /dev/null; then
                log_error "Ansible is not installed"
                echo "Install with: pip install ansible"
                exit 1
            fi
            ;;
        "kubernetes")
            if ! command -v kubectl &> /dev/null; then
                log_error "kubectl is not installed"
                echo "Install from: https://kubernetes.io/docs/tasks/tools/"
                exit 1
            fi
            if ! kubectl cluster-info &> /dev/null; then
                log_error "Cannot connect to Kubernetes cluster"
                exit 1
            fi
            ;;
        *)
            log_error "Invalid deployment method: $method"
            exit 1
            ;;
    esac
}

# Ansible deployment functions
ansible_deploy() {
    log_info "Deploying RavenDB cluster with Ansible..."

    cd "$ANSIBLE_DIR"

    # Check if vault password file exists
    if [[ ! -f "$VAULT_PASSWORD_FILE" ]]; then
        log_warning "Vault password file not found"
        read -s -p "Enter vault password: " vault_pass
        echo "$vault_pass" > "$VAULT_PASSWORD_FILE"
        chmod 600 "$VAULT_PASSWORD_FILE"
    fi

    # Deploy to all VPS instances
    ansible-playbook -i hosts.ini deploy-ravendb.yml \
        --vault-password-file "$VAULT_PASSWORD_FILE" \
        --extra-vars "enable_monitoring=true enable_backups=true"

    log_success "RavenDB cluster deployed successfully"
}

ansible_update() {
    log_info "Updating RavenDB cluster with rolling updates..."

    cd "$ANSIBLE_DIR"

    ansible-playbook -i hosts.ini cluster-management.yml \
        --vault-password-file "$VAULT_PASSWORD_FILE" \
        --extra-vars "update_strategy=rolling"

    log_success "RavenDB cluster updated successfully"
}

ansible_backup() {
    log_info "Creating backup of all RavenDB nodes..."

    cd "$ANSIBLE_DIR"

    local backup_dir="/backups/ravendb/$(date +%Y%m%d_%H%M%S)"
    ansible-playbook -i hosts.ini cluster-management.yml \
        --vault-password-file "$VAULT_PASSWORD_FILE" \
        --extra-vars "backup_dir=$backup_dir" \
        --tags backup

    log_success "Backup completed: $backup_dir"
}

ansible_status() {
    log_info "Checking cluster status..."

    cd "$ANSIBLE_DIR"

    ansible-playbook -i hosts.ini cluster-management.yml \
        --vault-password-file "$VAULT_PASSWORD_FILE" \
        --tags status
}

# Kubernetes deployment functions
k8s_deploy() {
    log_info "Deploying RavenDB cluster to Kubernetes..."

    cd "$K8S_DIR"

    # Create namespace and apply manifests
    kubectl apply -f ravendb-cluster.yaml

    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=ravendb -n ravendb --timeout=600s

    log_success "RavenDB cluster deployed to Kubernetes"

    # Get access information
    local lb_ip=$(kubectl get svc ravendb-lb -n ravendb -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [[ -n "$lb_ip" ]]; then
        log_success "Load Balancer IP: $lb_ip"
        log_info "Access RavenDB Studio at: http://$lb_ip:8080"
    else
        local port=$(kubectl get svc ravendb-lb -n ravendb -o jsonpath='{.spec.ports[0].nodePort}')
        log_info "Use port-forwarding: kubectl port-forward svc/ravendb-lb $port:8080 -n ravendb"
    fi
}

k8s_scale() {
    local replicas=${1:-3}
    log_info "Scaling RavenDB cluster to $replicas replicas..."

    kubectl scale statefulset ravendb-cluster --replicas=$replicas -n ravendb
    kubectl rollout status statefulset/ravendb-cluster -n ravendb

    log_success "Cluster scaled to $replicas replicas"
}

k8s_backup() {
    log_info "Creating backup from Kubernetes cluster..."

    local backup_pod=$(kubectl get pods -n ravendb -l app=ravendb --no-headers | head -1 | awk '{print $1}')

    kubectl exec "$backup_pod" -n ravendb -- \
        curl -X POST http://localhost:8080/admin/databases/ohriv-cluster/backup \
            -H "Content-Type: application/json" \
            -d '{"BackupType": "Full", "DestinationPath": "/backups/"}'

    log_success "Backup initiated from pod: $backup_pod"
}

k8s_status() {
    log_info "RavenDB Kubernetes Cluster Status:"
    echo ""

    echo "Pods:"
    kubectl get pods -n ravendb -l app=ravendb -o wide
    echo ""

    echo "Services:"
    kubectl get svc -n ravendb
    echo ""

    echo "Storage:"
    kubectl get pvc -n ravendb
    echo ""

    echo "Node Access:"
    for i in {1..3}; do
        local pod=$(kubectl get pods -n ravendb -l app=ravendb --no-headers | sed -n "${i}p" | awk '{print $1}')
        if [[ -n "$pod" ]]; then
            local pod_ip=$(kubectl get pod "$pod" -n ravendb -o jsonpath='{.status.podIP}')
            echo "  Node $i: $pod (IP: $pod_ip) - http://$pod_ip:8080"
        fi
    done
}

# Main functions
deploy_cluster() {
    log_info "Deploying RavenDB cluster using $DEPLOYMENT_METHOD..."
    check_prerequisites "$DEPLOYMENT_METHOD"

    case "$DEPLOYMENT_METHOD" in
        "ansible")
            ansible_deploy
            ;;
        "kubernetes")
            k8s_deploy
            ;;
    esac
}

update_cluster() {
    log_info "Updating RavenDB cluster..."
    check_prerequisites "$DEPLOYMENT_METHOD"

    case "$DEPLOYMENT_METHOD" in
        "ansible")
            ansible_update
            ;;
        "kubernetes")
            k8s_scale 3  # Kubernetes handles rolling updates automatically
            ;;
    esac
}

backup_cluster() {
    log_info "Creating cluster backup..."
    check_prerequisites "$DEPLOYMENT_METHOD"

    case "$DEPLOYMENT_METHOD" in
        "ansible")
            ansible_backup
            ;;
        "kubernetes")
            k8s_backup
            ;;
    esac
}

show_status() {
    log_info "Showing cluster status..."
    check_prerequisites "$DEPLOYMENT_METHOD"

    case "$DEPLOYMENT_METHOD" in
        "ansible")
            ansible_status
            ;;
        "kubernetes")
            k8s_status
            ;;
    esac
}

scale_cluster() {
    local replicas=$1
    if [[ -z "$replicas" ]]; then
        log_error "Please specify number of replicas"
        exit 1
    fi

    log_info "Scaling cluster to $replicas nodes..."
    check_prerequisites "$DEPLOYMENT_METHOD"

    case "$DEPLOYMENT_METHOD" in
        "ansible")
            log_warning "Manual scaling required for Ansible deployment"
            log_info "Add/remove nodes from hosts.ini and re-run deploy"
            ;;
        "kubernetes")
            k8s_scale "$replicas"
            ;;
    esac
}

# Show help
show_help() {
    echo "RavenDB Cluster Management Script"
    echo ""
    echo "Usage: $0 [ACTION] [OPTIONS]"
    echo ""
    echo "Environment Variables:"
    echo "  DEPLOYMENT_METHOD  - 'ansible' (default) or 'kubernetes'"
    echo "  ENVIRONMENT        - 'production' (default) or 'development'"
    echo ""
    echo "Actions:"
    echo "  deploy              Deploy RavenDB cluster"
    echo "  update              Update cluster with rolling updates"
    echo "  backup              Create cluster backup"
    echo "  status              Show cluster status"
    echo "  scale [N]           Scale cluster to N nodes (Kubernetes only)"
    echo "  help                Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                           # Deploy with default method (Ansible)"
    echo "  DEPLOYMENT_METHOD=kubernetes $0 deploy  # Deploy to Kubernetes"
    echo "  $0 scale 5                         # Scale Kubernetes cluster to 5 nodes"
    echo "  $0 status                          # Show cluster status"
    echo ""
    echo "Prerequisites:"
    echo "  Ansible:  pip install ansible"
    echo "  Kubernetes: kubectl configured to cluster"
    echo ""
    echo "Configuration:"
    echo "  Ansible: Edit deployment/ansible/hosts.ini"
    echo "  Kubernetes: Edit deployment/kubernetes/ravendb-cluster.yaml"
}

# Main script logic
ACTION=${1:-help}

case "$ACTION" in
    "deploy")
        deploy_cluster
        ;;
    "update")
        update_cluster
        ;;
    "backup")
        backup_cluster
        ;;
    "status")
        show_status
        ;;
    "scale")
        scale_cluster "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Unknown action: $ACTION"
        show_help
        exit 1
        ;;
esac