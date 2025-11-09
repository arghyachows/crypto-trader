.PHONY: help build up down restart logs clean test

# Colors for terminal output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Crypto Trading Platform - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

build: ## Build all Docker containers
	@echo "$(BLUE)Building Docker containers...$(NC)"
	docker-compose build

up: ## Start all services in detached mode
	@echo "$(BLUE)Starting all services...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Services started!$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8001"
	@echo "API Docs: http://localhost:8001/docs"

up-build: ## Build and start all services
	@echo "$(BLUE)Building and starting all services...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)✓ Services started!$(NC)"

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

down-volumes: ## Stop all services and remove volumes (clears database)
	@echo "$(YELLOW)Stopping services and removing volumes...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✓ Services stopped and volumes removed$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting all services...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Services restarted$(NC)"

restart-backend: ## Restart only backend service
	@echo "$(BLUE)Restarting backend...$(NC)"
	docker-compose restart backend
	@echo "$(GREEN)✓ Backend restarted$(NC)"

restart-frontend: ## Restart only frontend service
	@echo "$(BLUE)Restarting frontend...$(NC)"
	docker-compose restart frontend
	@echo "$(GREEN)✓ Frontend restarted$(NC)"

logs: ## Show logs for all services
	docker-compose logs -f

logs-backend: ## Show backend logs
	docker-compose logs -f backend

logs-frontend: ## Show frontend logs
	docker-compose logs -f frontend

logs-mongodb: ## Show MongoDB logs
	docker-compose logs -f mongodb

ps: ## Show running containers
	docker-compose ps

shell-backend: ## Open shell in backend container
	docker-compose exec backend bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-mongodb: ## Open MongoDB shell
	docker-compose exec mongodb mongosh

clean: ## Remove all containers, volumes, and images
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	docker-compose down -v --rmi all
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

status: ## Check service status
	@echo "$(BLUE)Service Status:$(NC)"
	@docker-compose ps

test: ## Run tests in backend container
	@echo "$(BLUE)Running tests...$(NC)"
	docker-compose exec backend pytest

prod-build: ## Build production containers
	@echo "$(BLUE)Building production containers...$(NC)"
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production services
	@echo "$(BLUE)Starting production services...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production services started!$(NC)"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:8001"

prod-down: ## Stop production services
	@echo "$(YELLOW)Stopping production services...$(NC)"
	docker-compose -f docker-compose.prod.yml down
	@echo "$(GREEN)✓ Production services stopped$(NC)"

dev: up ## Alias for 'make up' - Start development environment
	@echo ""

stop: down ## Alias for 'make down' - Stop all services
