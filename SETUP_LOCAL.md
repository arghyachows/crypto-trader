# Local Setup Guide

This guide helps you set up the project on your local machine using Docker.

## Prerequisites

1. **Install Docker Desktop**
   - Windows: [Download Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - Mac: [Download Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)

2. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

## Setup Steps

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd crypto-trader  # or whatever your folder is named
```

### Step 2: Generate yarn.lock (if missing)

If you don't have `yarn.lock` in the frontend folder:

```bash
cd frontend
yarn install
cd ..
```

This will generate the `yarn.lock` file needed for Docker build.

**Alternative**: The Dockerfile now handles missing yarn.lock automatically, but having it is recommended for consistent builds.

### Step 3: Start the Application

From the project root directory:

```bash
# Method 1: Using Docker Compose
docker-compose up -d

# Method 2: Using Makefile (if available)
make up

# Method 3: Using startup script (Linux/Mac)
./start.sh
```

### Step 4: Wait for Services to Start

The first build will take 5-10 minutes as it downloads images and installs dependencies.

You can monitor progress:
```bash
docker-compose logs -f
```

### Step 5: Access the Application

Once all services are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## Common Issues & Solutions

### Issue 1: "yarn.lock not found"

**Solution**: 
```bash
cd frontend
yarn install  # This generates yarn.lock
cd ..
docker-compose up -d --build
```

### Issue 2: "version is obsolete"

This is just a warning and can be ignored. The docker-compose files have been updated to remove this warning.

### Issue 3: Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution 1**: Stop the conflicting service
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Solution 2**: Change port in docker-compose.yml
```yaml
frontend:
  ports:
    - "3001:3000"  # Change external port to 3001
```

### Issue 4: Docker Daemon Not Running

**Error**: `Cannot connect to the Docker daemon`

**Solution**: 
- **Windows/Mac**: Start Docker Desktop application
- **Linux**: `sudo systemctl start docker`

### Issue 5: Permission Denied (Linux)

**Error**: `Permission denied while trying to connect to the Docker daemon`

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker

# Or run with sudo
sudo docker-compose up -d
```

### Issue 6: Frontend Won't Start

**Check logs**:
```bash
docker-compose logs frontend
```

**Common fixes**:
```bash
# Clear node_modules and rebuild
docker-compose down
rm -rf frontend/node_modules
docker-compose up -d --build
```

### Issue 7: Backend Can't Connect to MongoDB

**Solution**: Wait 15-30 seconds after starting. MongoDB needs time to initialize.

```bash
# Check if MongoDB is ready
docker-compose logs mongodb

# Restart backend after MongoDB is ready
docker-compose restart backend
```

## Verifying the Setup

### Check All Containers Are Running

```bash
docker-compose ps
```

You should see:
- crypto-mongodb (running)
- crypto-backend (running)
- crypto-frontend (running)

### Test Backend API

```bash
curl http://localhost:8001/api/cryptos
```

Should return a JSON response with cryptocurrency data.

### Test Frontend

Open browser: http://localhost:3000

You should see the login page.

## Development Workflow

### Making Code Changes

1. **Backend changes**: Edit files in `backend/` folder
   - Changes auto-reload (no restart needed)
   - For new dependencies: Add to `requirements.txt` and run `docker-compose up -d --build`

2. **Frontend changes**: Edit files in `frontend/src/` folder
   - Changes auto-reload (no restart needed)
   - For new dependencies: Add to `package.json` and run `docker-compose up -d --build`

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restarting Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stopping Services

```bash
# Stop without removing containers
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

## Project Structure

```
crypto-trader/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── yarn.lock          # Important! Generate if missing
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
└── README.md
```

## Environment Variables

### Backend (.env in backend folder)
```env
MONGO_URL=mongodb://mongodb:27017
DB_NAME=crypto_trading
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=*
```

### Frontend (.env in frontend folder)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Note**: When using Docker, these are set in `docker-compose.yml`, so you don't need separate .env files unless running without Docker.

## Useful Commands

```bash
# Start services
docker-compose up -d

# Start and rebuild
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh

# Remove everything (including volumes)
docker-compose down -v

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Windows-Specific Notes

### Using PowerShell

```powershell
# Navigate to project
cd D:\Vibe\crypto-trader

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Line Endings

If you encounter issues with shell scripts:
```bash
# Convert line endings
dos2unix start.sh stop.sh
```

Or in Git Bash:
```bash
sed -i 's/\r$//' start.sh
```

### WSL2 Backend

For better performance on Windows, ensure Docker Desktop is using WSL2 backend:
1. Open Docker Desktop
2. Go to Settings > General
3. Enable "Use the WSL 2 based engine"

## Mac-Specific Notes

### File Sharing

Ensure the project directory is in a shared location:
1. Docker Desktop > Preferences > Resources > File Sharing
2. Add your project path if needed

### Performance

For better performance, keep the project in your home directory or a shared location.

## Linux-Specific Notes

### Running Without Sudo

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### SELinux Issues

If you encounter permission issues with volumes:
```bash
# Add SELinux context
chcon -Rt svirt_sandbox_file_t /path/to/project
```

## Next Steps

1. **Create an Account**: Register at http://localhost:3000
2. **Explore**: Browse cryptocurrencies, view charts
3. **Trade**: Buy and sell crypto with your $10,000 starting balance
4. **Monitor**: Check your portfolio performance

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify containers: `docker-compose ps`
3. Review README.md for detailed documentation
4. Check DOCKER.md for advanced troubleshooting

## Clean Start (If Everything Fails)

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

---

**Still having issues?** Make sure Docker Desktop is running and you have at least 4GB of RAM allocated to Docker in settings.
