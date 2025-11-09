#!/bin/bash

# Crypto Trading Platform - Diagnostic Script
# This script helps diagnose common setup issues

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check Docker installation
check_docker() {
    print_header "Checking Docker Installation"
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is installed: $DOCKER_VERSION"
    else
        print_error "Docker is not installed"
        print_info "Install from: https://docs.docker.com/get-docker/"
        return 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose is installed: $COMPOSE_VERSION"
    else
        print_error "Docker Compose is not installed"
        print_info "Install from: https://docs.docker.com/compose/install/"
        return 1
    fi
    
    echo ""
}

# Check Docker daemon
check_docker_daemon() {
    print_header "Checking Docker Daemon"
    
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        print_info "Start Docker Desktop or run: sudo systemctl start docker"
        return 1
    fi
    
    echo ""
}

# Check required files
check_required_files() {
    print_header "Checking Required Files"
    
    files=(
        "docker-compose.yml"
        "backend/Dockerfile"
        "backend/requirements.txt"
        "backend/server.py"
        "frontend/Dockerfile"
        "frontend/package.json"
        "frontend/src/App.js"
    )
    
    all_good=true
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file is missing"
            all_good=false
        fi
    done
    
    # Check for yarn.lock
    if [ -f "frontend/yarn.lock" ]; then
        print_success "frontend/yarn.lock exists"
    else
        print_warning "frontend/yarn.lock is missing (will be generated)"
        print_info "Run: cd frontend && yarn install"
    fi
    
    echo ""
    return $([ "$all_good" = true ] && echo 0 || echo 1)
}

# Check ports
check_ports() {
    print_header "Checking Port Availability"
    
    ports=(3000 8001 27017)
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || netstat -an 2>/dev/null | grep -q ":$port.*LISTEN"; then
            print_warning "Port $port is already in use"
            print_info "Stop the service or change port in docker-compose.yml"
        else
            print_success "Port $port is available"
        fi
    done
    
    echo ""
}

# Check container status
check_containers() {
    print_header "Checking Container Status"
    
    if ! docker-compose ps &> /dev/null; then
        print_warning "No containers found (not started yet)"
        echo ""
        return
    fi
    
    containers=("crypto-mongodb" "crypto-backend" "crypto-frontend")
    
    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            status=$(docker inspect --format='{{.State.Status}}' $container 2>/dev/null)
            if [ "$status" = "running" ]; then
                print_success "$container is running"
            else
                print_error "$container exists but is not running (status: $status)"
            fi
        else
            print_warning "$container is not running"
        fi
    done
    
    echo ""
}

# Check container logs for errors
check_container_logs() {
    print_header "Checking Recent Container Logs"
    
    if ! docker ps --format '{{.Names}}' | grep -q "crypto-"; then
        print_warning "No running containers to check"
        echo ""
        return
    fi
    
    containers=("crypto-mongodb" "crypto-backend" "crypto-frontend")
    
    for container in "${containers[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
            echo -e "${BLUE}Last 5 lines from $container:${NC}"
            docker logs --tail 5 $container 2>&1 | sed 's/^/  /'
            
            # Check for common error patterns
            errors=$(docker logs --tail 50 $container 2>&1 | grep -i "error\|exception\|failed\|cannot" | wc -l)
            if [ $errors -gt 0 ]; then
                print_warning "Found $errors potential error(s) in logs"
            fi
            echo ""
        fi
    done
}

# Test connectivity
test_connectivity() {
    print_header "Testing Service Connectivity"
    
    # Test backend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/api/cryptos | grep -q "200\|401"; then
        print_success "Backend API is accessible at http://localhost:8001"
    else
        print_error "Cannot connect to backend at http://localhost:8001"
        print_info "Check backend logs: docker-compose logs backend"
    fi
    
    # Test frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        print_success "Frontend is accessible at http://localhost:3000"
    else
        print_error "Cannot connect to frontend at http://localhost:3000"
        print_info "Check frontend logs: docker-compose logs frontend"
    fi
    
    echo ""
}

# Check disk space
check_disk_space() {
    print_header "Checking Disk Space"
    
    available=$(df -h . | awk 'NR==2 {print $4}')
    print_info "Available space: $available"
    
    docker_size=$(docker system df 2>/dev/null | grep "Total" | awk '{print $4}' || echo "Unknown")
    print_info "Docker disk usage: $docker_size"
    
    echo ""
}

# System info
show_system_info() {
    print_header "System Information"
    
    print_info "OS: $(uname -s)"
    print_info "Architecture: $(uname -m)"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        print_info "Distribution: $NAME $VERSION"
    fi
    
    echo ""
}

# Suggestions
provide_suggestions() {
    print_header "Troubleshooting Suggestions"
    
    echo -e "${YELLOW}If you're experiencing issues, try these steps:${NC}"
    echo ""
    echo "1. Ensure Docker Desktop is running (Windows/Mac)"
    echo "2. Generate yarn.lock if missing:"
    echo "   ${BLUE}cd frontend && yarn install && cd ..${NC}"
    echo ""
    echo "3. Clean rebuild:"
    echo "   ${BLUE}docker-compose down -v${NC}"
    echo "   ${BLUE}docker-compose build --no-cache${NC}"
    echo "   ${BLUE}docker-compose up -d${NC}"
    echo ""
    echo "4. Check logs for specific errors:"
    echo "   ${BLUE}docker-compose logs -f${NC}"
    echo ""
    echo "5. Free up disk space:"
    echo "   ${BLUE}docker system prune -a${NC}"
    echo ""
    echo "6. For Windows users with yarn.lock issues:"
    echo "   ${BLUE}cd frontend && yarn install && cd ..${NC}"
    echo "   ${BLUE}docker-compose up -d --build${NC}"
    echo ""
}

# Main execution
main() {
    clear
    echo ""
    print_header "Crypto Trading Platform - Diagnostic Tool"
    echo ""
    
    show_system_info
    check_docker || exit 1
    check_docker_daemon || exit 1
    check_required_files
    check_ports
    check_disk_space
    check_containers
    check_container_logs
    test_connectivity
    provide_suggestions
    
    print_header "Diagnosis Complete"
    echo ""
    echo "For more help, see:"
    echo "  • SETUP_LOCAL.md - Local setup guide"
    echo "  • DOCKER.md - Comprehensive Docker documentation"
    echo "  • README.md - Full project documentation"
    echo ""
}

# Run main
main
