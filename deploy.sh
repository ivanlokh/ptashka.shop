#!/bin/bash

# Ptashka.shop Deployment Script
# Usage: ./deploy.sh [environment] [action]
# Environment: dev, staging, prod
# Action: deploy, rollback, status, logs

set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-deploy}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ptashka-shop"
BACKUP_DIR="./backups"
LOG_DIR="./logs"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if required tools are installed
check_requirements() {
    log "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git is not installed"
    fi
    
    success "All requirements satisfied"
}

# Create necessary directories
setup_directories() {
    log "Setting up directories..."
    
    mkdir -p $BACKUP_DIR
    mkdir -p $LOG_DIR
    mkdir -p ./nginx/logs
    mkdir -p ./nginx/ssl
    
    success "Directories created"
}

# Load environment variables
load_env() {
    log "Loading environment variables for $ENVIRONMENT..."
    
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        error "Environment file .env.$ENVIRONMENT not found"
    fi
    
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
    success "Environment variables loaded"
}

# Backup current deployment
backup() {
    log "Creating backup..."
    
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p $BACKUP_PATH
    
    # Backup database
    if [ "$ENVIRONMENT" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_PATH/database.sql
        success "Database backed up to $BACKUP_PATH/database.sql"
    fi
    
    # Backup configuration files
    cp -r ./nginx $BACKUP_PATH/
    cp -r ./monitoring $BACKUP_PATH/
    cp .env.$ENVIRONMENT $BACKUP_PATH/
    
    success "Backup created: $BACKUP_NAME"
}

# Pull latest code
pull_code() {
    log "Pulling latest code..."
    
    git fetch origin
    git reset --hard origin/main
    
    success "Code updated"
}

# Build and deploy
deploy() {
    log "Starting deployment for $ENVIRONMENT environment..."
    
    # Pull latest code
    pull_code
    
    # Create backup
    backup
    
    # Setup directories
    setup_directories
    
    # Load environment variables
    load_env
    
    # Build and start services
    if [ "$ENVIRONMENT" = "prod" ]; then
        log "Building production images..."
        docker-compose -f docker-compose.prod.yml build --no-cache
        
        log "Starting production services..."
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services to be healthy
        log "Waiting for services to be healthy..."
        sleep 30
        
        # Check health
        check_health
        
    else
        log "Building development images..."
        docker-compose build --no-cache
        
        log "Starting development services..."
        docker-compose up -d
        
        # Wait for services to be healthy
        log "Waiting for services to be healthy..."
        sleep 15
        
        # Check health
        check_health
    fi
    
    success "Deployment completed successfully!"
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check backend health
    if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
        error "Backend health check failed"
    fi
    
    # Check frontend health
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        error "Frontend health check failed"
    fi
    
    success "All services are healthy"
}

# Show deployment status
status() {
    log "Checking deployment status..."
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml ps
    else
        docker-compose ps
    fi
    
    echo ""
    log "Service URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001"
    echo "  Health:   http://localhost:3001/health"
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        echo "  Grafana:  http://localhost:3001"
        echo "  Prometheus: http://localhost:9090"
    fi
}

# Show logs
logs() {
    log "Showing logs for $ENVIRONMENT environment..."
    
    if [ "$ENVIRONMENT" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Rollback to previous version
rollback() {
    log "Rolling back deployment..."
    
    # List available backups
    echo "Available backups:"
    ls -la $BACKUP_DIR
    
    read -p "Enter backup name to rollback to: " BACKUP_NAME
    
    if [ ! -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
        error "Backup $BACKUP_NAME not found"
    fi
    
    # Stop current services
    if [ "$ENVIRONMENT" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml down
    else
        docker-compose down
    fi
    
    # Restore backup
    cp -r $BACKUP_DIR/$BACKUP_NAME/* ./
    
    # Restart services
    if [ "$ENVIRONMENT" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml up -d
    else
        docker-compose up -d
    fi
    
    success "Rollback completed"
}

# Clean up old containers and images
cleanup() {
    log "Cleaning up old containers and images..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    success "Cleanup completed"
}

# Main script logic
main() {
    log "Ptashka.shop Deployment Script"
    log "Environment: $ENVIRONMENT"
    log "Action: $ACTION"
    
    case $ACTION in
        deploy)
            check_requirements
            deploy
            ;;
        status)
            status
            ;;
        logs)
            logs
            ;;
        rollback)
            rollback
            ;;
        cleanup)
            cleanup
            ;;
        *)
            error "Unknown action: $ACTION. Available actions: deploy, status, logs, rollback, cleanup"
            ;;
    esac
}

# Run main function
main "$@"
