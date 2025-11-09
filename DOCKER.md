# Docker Documentation - Crypto Trading Platform

This document provides comprehensive information about running the Crypto Trading Platform using Docker.

## Table of Contents
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Docker Compose Services](#docker-compose-services)
- [Environment Variables](#environment-variables)
- [Volume Management](#volume-management)
- [Networking](#networking)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux) 20.10+
- Docker Compose v2.0+

### Start the Application
```bash
# Clone the repository
git clone <repository-url>
cd /app

# Start all services
docker-compose up -d

# Or using Makefile
make up
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

## Architecture

The application consists of three main containers:

```
┌─────────────────────────────────────────────────────────┐
│                    crypto-network                        │
│                   (Bridge Network)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   Backend    │  │   MongoDB    │ │
│  │  (React)     │─>│  (FastAPI)   │─>│  (Database)  │ │
│  │  Port: 3000  │  │  Port: 8001  │  │  Port: 27017 │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Container Details

#### 1. MongoDB Container (`crypto-mongodb`)
- **Image**: mongo:7.0
- **Port**: 27017
- **Volume**: mongodb_data (persistent storage)
- **Purpose**: Database for users, portfolios, and transactions

#### 2. Backend Container (`crypto-backend`)
- **Base Image**: python:3.11-slim
- **Port**: 8001
- **Dependencies**: FastAPI, Motor, PyJWT, Bcrypt
- **Features**: 
  - Hot reload enabled for development
  - Automatic restart on crash
  - Connected to MongoDB via internal network

#### 3. Frontend Container (`crypto-frontend`)
- **Base Image**: node:18-alpine
- **Port**: 3000
- **Dependencies**: React 19, Tailwind CSS, Radix UI
- **Features**:
  - Hot reload enabled for development
  - Automatic restart on crash
  - Proxies API requests to backend

## Development Setup

### Using docker-compose.yml

The development setup includes:
- Hot reload for both frontend and backend
- Volume mounts for live code changes
- Debug-friendly configurations
- Development-optimized images

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild after dependency changes
docker-compose up -d --build
```

### Dockerfile Configurations

#### Backend (Development)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
```

#### Frontend (Development)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]
```

### Volume Mounts

Development volumes enable hot reload:
```yaml
backend:
  volumes:
    - ./backend:/app  # Live code sync

frontend:
  volumes:
    - ./frontend:/app
    - /app/node_modules  # Preserve node_modules
```

## Production Setup

### Using docker-compose.prod.yml

Production setup includes:
- Optimized builds (multi-stage)
- No hot reload
- Nginx for serving frontend
- Security hardening
- Smaller image sizes

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Or using Makefile
make prod-up
```

### Production Dockerfile Differences

#### Backend (Production)
- No `--reload` flag
- Optimized for performance
- Smaller attack surface

#### Frontend (Production)
- Multi-stage build
- React production build
- Served by Nginx
- Port 80 (standard HTTP)
- Gzip compression
- Static asset caching

### Nginx Configuration

The production frontend uses Nginx with:
- Client-side routing support
- Gzip compression
- Static asset caching (1 year)
- Security headers
- Optimized for performance

## Docker Compose Services

### Development Services (docker-compose.yml)

```yaml
services:
  mongodb:
    image: mongo:7.0
    ports: ["27017:27017"]
    volumes: [mongodb_data:/data/db]
    
  backend:
    build: ./backend
    ports: ["8001:8001"]
    volumes: [./backend:/app]
    depends_on: [mongodb]
    
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: [./frontend:/app]
    depends_on: [backend]
```

### Environment Variables in Docker Compose

Variables are defined directly in `docker-compose.yml`:

```yaml
backend:
  environment:
    - MONGO_URL=mongodb://mongodb:27017
    - DB_NAME=crypto_trading
    - JWT_SECRET=your-secret-key
    - CORS_ORIGINS=*

frontend:
  environment:
    - REACT_APP_BACKEND_URL=http://localhost:8001
    - CHOKIDAR_USEPOLLING=true  # For hot reload
```

## Environment Variables

### Backend Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| MONGO_URL | MongoDB connection string | mongodb://mongodb:27017 | Yes |
| DB_NAME | Database name | crypto_trading | Yes |
| JWT_SECRET | Secret for JWT tokens | (generate secure key) | Yes |
| CORS_ORIGINS | Allowed CORS origins | * | No |

### Frontend Variables
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| REACT_APP_BACKEND_URL | Backend API URL | http://localhost:8001 | Yes |
| CHOKIDAR_USEPOLLING | Enable polling for hot reload | true | No |
| WATCHPACK_POLLING | Enable webpack polling | true | No |

### Setting Custom Variables

#### Method 1: Edit docker-compose.yml
```yaml
backend:
  environment:
    - JWT_SECRET=my-super-secret-key-change-this
```

#### Method 2: Use .env file
Create `.env` in project root:
```env
JWT_SECRET=my-super-secret-key
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

Update docker-compose.yml:
```yaml
backend:
  environment:
    - JWT_SECRET=${JWT_SECRET}
    - CORS_ORIGINS=${CORS_ORIGINS}
```

## Volume Management

### Persistent Data

MongoDB data persists in a named volume:
```yaml
volumes:
  mongodb_data:
    driver: local
```

### Volume Commands

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect app_mongodb_data

# Remove volume (deletes all data!)
docker volume rm app_mongodb_data

# Backup volume
docker run --rm -v app_mongodb_data:/data -v $(pwd):/backup ubuntu tar czf /backup/mongodb-backup.tar.gz /data

# Restore volume
docker run --rm -v app_mongodb_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/mongodb-backup.tar.gz -C /
```

## Networking

### Bridge Network

All services communicate through `crypto-network`:
```yaml
networks:
  crypto-network:
    driver: bridge
```

### Service Communication

Services reference each other by service name:
```yaml
# Backend connects to MongoDB
MONGO_URL=mongodb://mongodb:27017

# Frontend connects to backend (from host)
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Port Mapping

| Service | Internal Port | External Port |
|---------|--------------|---------------|
| Frontend | 3000 | 3000 |
| Backend | 8001 | 8001 |
| MongoDB | 27017 | 27017 |

## Troubleshooting

### Container Won't Start

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Rebuild container
docker-compose up -d --build [service-name]
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or 8001, 27017

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Hot Reload Not Working

For Windows/Mac users, ensure file watching is enabled:
```yaml
frontend:
  environment:
    - CHOKIDAR_USEPOLLING=true
    - WATCHPACK_POLLING=true
```

### Database Connection Failed

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check logs
docker-compose logs mongodb

# Verify connection from backend
docker-compose exec backend ping mongodb
```

### Permission Issues (Linux)

```bash
# Fix ownership
sudo chown -R $USER:$USER ./

# Or run with sudo
sudo docker-compose up -d
```

### Cannot Access Frontend

1. Check container is running: `docker-compose ps frontend`
2. Check logs: `docker-compose logs frontend`
3. Verify port mapping: `docker-compose ps`
4. Test directly: `curl http://localhost:3000`

### Backend API Errors

1. Check backend logs: `docker-compose logs backend`
2. Verify MongoDB connection: `docker-compose logs mongodb`
3. Test API: `curl http://localhost:8001/api/cryptos`
4. Check environment variables: `docker-compose exec backend env`

## Best Practices

### Development
1. Use `docker-compose up -d` for detached mode
2. Use `docker-compose logs -f` to monitor logs
3. Rebuild after dependency changes: `docker-compose up -d --build`
4. Use named volumes for database persistence
5. Keep docker-compose.yml in version control
6. Use `.dockerignore` to exclude unnecessary files

### Production
1. Use multi-stage builds to reduce image size
2. Don't run as root user
3. Use specific image tags (not `latest`)
4. Set resource limits
5. Enable health checks
6. Use secrets for sensitive data
7. Regularly update base images
8. Monitor container metrics

### Security
1. Never commit `.env` files with secrets
2. Use strong JWT secrets
3. Limit CORS origins in production
4. Use HTTPS in production
5. Keep Docker and images updated
6. Scan images for vulnerabilities
7. Use read-only file systems where possible

## Common Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f [service]

# Execute commands in container
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec mongodb mongosh

# Rebuild containers
docker-compose up -d --build

# View running containers
docker-compose ps

# Check resource usage
docker stats

# Clean up everything
docker-compose down -v --rmi all

# Production deployment
docker-compose -f docker-compose.prod.yml up -d --build
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [React Docker Best Practices](https://create-react-app.dev/docs/deployment/)

---

**Need Help?**
- Check the main README.md for application details
- Review logs: `docker-compose logs -f`
- Verify configuration: `docker-compose config`
- Ask for help: Create an issue with logs and configuration
