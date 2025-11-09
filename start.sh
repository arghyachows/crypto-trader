#!/bin/bash

# Crypto Trading Platform - Startup Script
# This script helps you quickly start the application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_color "$RED" "❌ Docker is not installed!"
        print_color "$YELLOW" "Please install Docker from: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_color "$GREEN" "✓ Docker is installed"
}

# Function to check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_color "$RED" "❌ Docker Compose is not installed!"
        print_color "$YELLOW" "Please install Docker Compose from: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_color "$GREEN" "✓ Docker Compose is installed"
}

# Function to check if Docker daemon is running
check_docker_running() {
    if ! docker info &> /dev/null; then
        print_color "$RED" "❌ Docker daemon is not running!"
        print_color "$YELLOW" "Please start Docker Desktop or Docker service"
        exit 1
    fi
    print_color "$GREEN" "✓ Docker daemon is running"
}

# Function to stop any existing containers
cleanup_existing() {
    print_color "$BLUE" "Checking for existing containers..."
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        print_color "$YELLOW" "Stopping existing containers..."
        docker-compose down
        print_color "$GREEN" "✓ Existing containers stopped"
    else
        print_color "$GREEN" "✓ No existing containers found"
    fi
}

# Function to start the application
start_application() {
    print_color "$BLUE" "Starting Crypto Trading Platform..."
    print_color "$YELLOW" "This may take a few minutes on first run..."
    
    if docker-compose up -d --build; then
        print_color "$GREEN" "✓ Application started successfully!"
    else
        print_color "$RED" "❌ Failed to start application"
        print_color "$YELLOW" "Check logs with: docker-compose logs"
        exit 1
    fi
}

# Function to wait for services to be ready
wait_for_services() {
    print_color "$BLUE" "Waiting for services to be ready..."
    
    # Wait for backend
    print_color "$YELLOW" "Waiting for backend..."
    for i in {1..30}; do
        if curl -s http://localhost:8001/api/cryptos > /dev/null 2>&1; then
            print_color "$GREEN" "✓ Backend is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_color "$RED" "⚠ Backend might not be ready yet"
        fi
        sleep 2
    done
    
    # Wait for frontend
    print_color "$YELLOW" "Waiting for frontend..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_color "$GREEN" "✓ Frontend is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_color "$RED" "⚠ Frontend might not be ready yet"
        fi
        sleep 2
    done
}

# Function to display service information
show_info() {
    echo ""
    print_color "$GREEN" "════════════════════════════════════════════════════════"
    print_color "$GREEN" "  🚀 Crypto Trading Platform is running!"
    print_color "$GREEN" "════════════════════════════════════════════════════════"
    echo ""
    print_color "$BLUE" "📱 Frontend:          http://localhost:3000"
    print_color "$BLUE" "🔧 Backend API:       http://localhost:8001"
    print_color "$BLUE" "📚 API Docs:          http://localhost:8001/docs"
    print_color "$BLUE" "🗄️  MongoDB:           localhost:27017"
    echo ""
    print_color "$YELLOW" "Useful commands:"
    print_color "$NC" "  • View logs:          docker-compose logs -f"
    print_color "$NC" "  • Stop services:      docker-compose down"
    print_color "$NC" "  • Restart services:   docker-compose restart"
    print_color "$NC" "  • Check status:       docker-compose ps"
    print_color "$NC" "  • Use Makefile:       make help"
    echo ""
    print_color "$GREEN" "════════════════════════════════════════════════════════"
}

# Main execution
main() {
    print_color "$BLUE" "════════════════════════════════════════════════════════"
    print_color "$BLUE" "  Crypto Trading Platform - Startup Script"
    print_color "$BLUE" "════════════════════════════════════════════════════════"
    echo ""
    
    # Run checks
    check_docker
    check_docker_compose
    check_docker_running
    
    echo ""
    
    # Cleanup and start
    cleanup_existing
    start_application
    
    echo ""
    
    # Wait for services
    wait_for_services
    
    # Show information
    show_info
}

# Run main function
main
