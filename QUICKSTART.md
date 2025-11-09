# Quick Start Guide - Crypto Trading Platform

Get up and running in less than 5 minutes! 🚀

## For the Impatient 😄

```bash
git clone <repository-url> && cd /app && ./start.sh
```

That's it! Visit http://localhost:3000

## Step-by-Step Guide

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac)
- Or install Docker Engine (Linux): `curl -fsSL https://get.docker.com | sh`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd /app
   ```

2. **Start the application**
   
   Choose one method:
   
   **Option A: Using the startup script (Recommended)**
   ```bash
   ./start.sh
   ```
   
   **Option B: Using Makefile**
   ```bash
   make up
   ```
   
   **Option C: Using Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

### First Time Use

1. **Register a new account**
   - Click "Sign Up" on the login page
   - Enter your email, name, and password
   - You'll start with $10,000 USD balance

2. **Browse cryptocurrencies**
   - View the list of top 100 cryptocurrencies
   - Use the search bar to find specific coins

3. **Buy cryptocurrency**
   - Click on any cryptocurrency
   - Enter the amount you want to buy
   - Review the transaction preview
   - Confirm the purchase

4. **Track your portfolio**
   - View your holdings in the Portfolio page
   - See real-time profit/loss
   - Check top performers and biggest declines

5. **View charts**
   - Select different timeframes (1D, 7D, 30D, 1Y)
   - Analyze price trends

6. **Sell cryptocurrency**
   - Go to Portfolio
   - Click Sell on any holding
   - Review profit/loss before confirming

## Common Tasks

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop the Application
```bash
# Using stop script
./stop.sh

# Using Makefile
make down

# Using Docker Compose
docker-compose down
```

### Restart the Application
```bash
# Using Makefile
make restart

# Using Docker Compose
docker-compose restart
```

### Check Service Status
```bash
docker-compose ps
```

## Troubleshooting

### Containers won't start?
```bash
docker-compose down
docker-compose up -d --build
```

### Port already in use?
Change ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001 for frontend
  - "8002:8001"  # Change 8001 to 8002 for backend
```

### Can't access the application?
1. Check if containers are running: `docker-compose ps`
2. Check logs: `docker-compose logs`
3. Wait 30 seconds after starting (services need time to initialize)

### Database is empty after restart?
This is normal! The database persists in a Docker volume. If you used `docker-compose down -v`, the volume was deleted.

## What's Next?

- Read the full [README.md](./README.md) for detailed features
- Check [DOCKER.md](./DOCKER.md) for advanced Docker usage
- Explore the API at http://localhost:8001/docs

## Need Help?

- Check logs: `docker-compose logs -f`
- View running containers: `docker-compose ps`
- See all commands: `make help`
- Read troubleshooting in [README.md](./README.md)

## Development

To make code changes with hot reload:

1. Edit files in `backend/` or `frontend/` directories
2. Changes will automatically reload (no restart needed)
3. For dependency changes:
   ```bash
   docker-compose up -d --build
   ```

## Clean Up

To remove everything (containers, volumes, images):
```bash
docker-compose down -v --rmi all
```

---

**Happy Trading! 🎉📈**
