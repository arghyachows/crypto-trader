#!/bin/bash

# Crypto Trading Platform - Stop Script
# This script helps you stop the application

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

# Main execution
main() {
    print_color "$BLUE" "════════════════════════════════════════════════════════"
    print_color "$BLUE" "  Stopping Crypto Trading Platform"
    print_color "$BLUE" "════════════════════════════════════════════════════════"
    echo ""
    
    # Check if containers are running
    if ! docker-compose ps -q 2>/dev/null | grep -q .; then
        print_color "$YELLOW" "⚠ No running containers found"
        exit 0
    fi
    
    # Ask user if they want to remove volumes
    print_color "$YELLOW" "Do you want to remove database volumes? (This will delete all data)"
    print_color "$NC" "  [y] Yes - Stop and remove all data"
    print_color "$NC" "  [n] No - Stop but keep data (default)"
    echo ""
    read -p "Choice [y/N]: " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_color "$RED" "Stopping containers and removing volumes..."
        docker-compose down -v
        print_color "$GREEN" "✓ Services stopped and volumes removed"
    else
        print_color "$BLUE" "Stopping containers (keeping data)..."
        docker-compose down
        print_color "$GREEN" "✓ Services stopped (data preserved)"
    fi
    
    echo ""
    print_color "$GREEN" "════════════════════════════════════════════════════════"
    print_color "$GREEN" "  Services stopped successfully"
    print_color "$GREEN" "════════════════════════════════════════════════════════"
    echo ""
    print_color "$YELLOW" "To start again, run: ./start.sh or docker-compose up -d"
    echo ""
}

# Run main function
main
