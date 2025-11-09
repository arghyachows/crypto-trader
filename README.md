# Crypto Trading Platform

A full-stack cryptocurrency trading platform built with React, FastAPI, and MongoDB. Users can buy and sell cryptocurrencies, track their portfolio performance, view detailed charts, and monitor their transaction history.

## 🚀 Features

### Authentication & User Management
- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- Protected API routes
- User balance management ($10,000 starting balance)

### Cryptocurrency Market
- Real-time cryptocurrency data from CoinGecko API
- Top 100 cryptocurrencies by market cap
- Search functionality to find specific cryptocurrencies
- Live price updates and 24h price changes
- Market cap and trading volume information

### Trading Features
- **Buy Cryptocurrencies**: Purchase crypto with USD balance
- **Sell Cryptocurrencies**: Sell holdings back to USD
- **Transaction Preview Dialogs**: Review transaction details before confirming
  - Shows transaction summary (quantity, price, total)
  - Displays balance impact (before/after)
  - Shows portfolio impact for sells
  - Calculates profit/loss for sell transactions
- Balance validation and insufficient funds protection
- Average buy price calculation for portfolio positions

### Portfolio Management
- View all cryptocurrency holdings
- Real-time portfolio valuation
- Individual holding performance metrics:
  - Current value vs invested amount
  - Profit/loss in USD
  - Profit/loss percentage
- Portfolio summary with aggregated metrics:
  - Total portfolio value
  - Total invested amount
  - Overall profit/loss
  - Overall profit/loss percentage
- **Top Performers**: Highlights 3 best performing holdings
- **Biggest Declines**: Shows 3 worst performing holdings

### Charts & Analytics
- Interactive price charts powered by Recharts
- Multiple timeframe selection:
  - 1 Day (1D)
  - 7 Days (7D)
  - 30 Days (30D)
  - 90 Days (90D)
  - 1 Year (1Y)
- Historical price data visualization
- Responsive chart design

### Transaction History
- Complete transaction log (buys and sells)
- Transaction details: type, quantity, price, total amount
- Sorted by most recent first
- Transaction timestamps

### Enhanced Dashboard
- Portfolio overview with key metrics
- Top performers section showing best holdings
- Biggest declines section showing worst holdings
- Quick access to portfolio value and profit/loss
- Visual indicators for gains and losses

## 🚀 Quick Start

### Using Docker (Recommended - 2 Commands!)
```bash
# 1. Clone the repository
git clone <repository-url> && cd /app

# 2. Start everything with Docker
docker-compose up -d

# Access: http://localhost:3000
```

> 📘 **Detailed Docker Documentation**: See [DOCKER.md](./DOCKER.md) for comprehensive Docker setup, troubleshooting, and best practices.

### Using Local Development
```bash
# 1. Start MongoDB
sudo systemctl start mongod  # or use MongoDB Atlas

# 2. Start Backend
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Start Frontend (new terminal)
cd /app/frontend
yarn install
yarn start

# Access: http://localhost:3000
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database with Motor async driver
- **PyJWT**: JWT token authentication
- **Bcrypt**: Password hashing
- **HTTPX**: Async HTTP client for external APIs
- **Pydantic**: Data validation and settings management
- **Python-dotenv**: Environment variable management

### Frontend
- **React 19**: Modern React with latest features
- **React Router v7**: Client-side routing
- **Axios**: HTTP client for API requests
- **Recharts**: Chart library for data visualization
- **Radix UI**: Headless UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React Hook Form**: Form validation
- **Sonner**: Toast notifications

## 📋 Prerequisites

### Option 1: Docker (Recommended)
- Docker Desktop or Docker Engine (20.10+)
- Docker Compose (v2.0+)

### Option 2: Local Development
- Node.js (v16 or higher)
- Python 3.9+
- MongoDB (local or MongoDB Atlas)
- Yarn package manager

## ⚙️ Installation & Setup

### 🐳 Option 1: Docker Setup (Recommended)

Docker provides the easiest way to run the entire application with all dependencies.

#### Quick Start with Docker

1. **Clone the Repository**
```bash
git clone <repository-url>
cd /app
```

2. **Start All Services**
```bash
docker-compose up -d
```

This single command will:
- Start MongoDB container
- Build and start the backend API
- Build and start the frontend application
- Set up networking between all services

3. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs
- MongoDB: localhost:27017

4. **View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

5. **Stop Services**
```bash
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

#### Docker Commands Reference

##### Using Makefile (Recommended)
```bash
# Show all available commands
make help

# Start development environment
make up

# Build and start
make up-build

# Stop services
make down

# Restart services
make restart

# View logs
make logs
make logs-backend
make logs-frontend

# Open shell in container
make shell-backend
make shell-frontend

# Check status
make status

# Clean everything
make clean
```

##### Using Docker Compose Directly
```bash
# Start services in detached mode
docker-compose up -d

# Start services with build
docker-compose up -d --build

# Stop services
docker-compose stop

# Restart a specific service
docker-compose restart backend

# View running containers
docker-compose ps

# Execute commands in container
docker-compose exec backend bash
docker-compose exec frontend sh

# View service logs
docker-compose logs -f [service-name]

# Remove all containers and volumes
docker-compose down -v
```

#### Production Docker Setup

For production deployment with optimized builds:

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# Frontend will be served by Nginx on port 80
# Backend runs without hot-reload for better performance
```

#### Environment Variables for Docker

The `docker-compose.yml` file includes all necessary environment variables. To customize:

1. Create `.env` file in the root directory:
```env
JWT_SECRET=your-production-secret-key
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

2. Docker Compose will automatically use these variables.

---

### 💻 Option 2: Local Development Setup

For development without Docker:

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd /app
```

#### 2. Install MongoDB
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Or use MongoDB Atlas (cloud)
```

#### 3. Backend Setup

**Install Python Dependencies**
```bash
cd /app/backend
pip install -r requirements.txt
```

**Configure Environment Variables**

Create `/app/backend/.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=crypto_trading
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=*
```

**Start Backend**
```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### 4. Frontend Setup

**Install Node Dependencies**
```bash
cd /app/frontend
yarn install
```

**Configure Environment Variables**

Create `/app/frontend/.env` file:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Start Frontend**
```bash
cd /app/frontend
yarn start
```

#### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

---

### 🔧 Alternative: Supervisor Setup

If running in a container environment with Supervisor:

#### Start All Services
```bash
sudo supervisorctl restart all
```

#### Start Individual Services
```bash
# Restart backend only
sudo supervisorctl restart backend

# Restart frontend only
sudo supervisorctl restart frontend
```

#### Check Service Status
```bash
sudo supervisorctl status
```

#### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs
tail -f /var/log/supervisor/frontend.*.log
```

## 🌐 Application Access

### Docker Setup
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs
- **MongoDB**: localhost:27017
- **API Base URL**: All backend routes are prefixed with `/api`

### Local/Supervisor Setup
- **Frontend**: Port 3000
- **Backend API**: Port 8001
- **API Base URL**: All backend routes are prefixed with `/api`

## 🐳 Docker Architecture

The application consists of three Docker containers:

1. **MongoDB Container** (`crypto-mongodb`)
   - Image: mongo:7.0
   - Port: 27017
   - Volume: Persistent data storage
   - Network: crypto-network

2. **Backend Container** (`crypto-backend`)
   - Built from: backend/Dockerfile
   - Port: 8001
   - Environment: Python 3.11, FastAPI
   - Features: Hot reload enabled for development
   - Depends on: MongoDB

3. **Frontend Container** (`crypto-frontend`)
   - Built from: frontend/Dockerfile
   - Port: 3000
   - Environment: Node 18, React
   - Features: Hot reload enabled for development
   - Depends on: Backend

All containers communicate through a Docker bridge network (`crypto-network`).

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (protected)

#### Cryptocurrencies
- `GET /api/cryptos` - Get list of cryptocurrencies (with optional search)
- `GET /api/cryptos/{crypto_id}?days={timeframe}` - Get crypto details with chart data

#### Portfolio
- `GET /api/portfolio` - Get user's portfolio holdings (protected)
- `GET /api/portfolio/summary` - Get portfolio summary with performance metrics (protected)
- `POST /api/portfolio/buy` - Buy cryptocurrency (protected)
- `POST /api/portfolio/sell` - Sell cryptocurrency (protected)

#### Transactions
- `GET /api/transactions` - Get transaction history (protected)

## 🏗️ Project Structure

```
/app/
├── backend/
│   ├── server.py           # FastAPI application with all routes
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker image for development
│   ├── Dockerfile.prod     # Docker image for production
│   ├── .dockerignore       # Files to exclude from Docker build
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── Layout.jsx
│   │   │   ├── TransactionDialog.jsx
│   │   │   └── ui/        # Radix UI components
│   │   ├── pages/         # Page components
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CryptoList.jsx
│   │   │   ├── CryptoDetail.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   └── Transactions.jsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── App.js         # Main app component with routing
│   │   └── index.js       # Application entry point
│   ├── package.json       # Node dependencies
│   ├── Dockerfile         # Docker image for development
│   ├── Dockerfile.prod    # Docker image for production
│   ├── nginx.conf         # Nginx config for production
│   ├── .dockerignore      # Files to exclude from Docker build
│   └── .env              # Frontend environment variables
├── docker-compose.yml      # Docker Compose for development
├── docker-compose.prod.yml # Docker Compose for production
├── .dockerignore          # Root Docker ignore file
├── .env.docker.example    # Example environment variables
├── tests/                 # Test files
└── README.md             # This file
```

## 🔒 Security Features

- JWT-based authentication with token expiration
- Password hashing with bcrypt
- Protected API routes requiring authentication
- CORS configuration for secure cross-origin requests
- Input validation with Pydantic models
- Balance and holdings validation before transactions

## 📊 Database Schema

### Users Collection
```javascript
{
  id: String (UUID),
  email: String (unique),
  name: String,
  password: String (hashed),
  balance: Number,
  created_at: String (ISO timestamp)
}
```

### Portfolios Collection
```javascript
{
  user_id: String,
  crypto_id: String,
  crypto_symbol: String,
  crypto_name: String,
  quantity: Number,
  average_buy_price: Number,
  total_invested: Number
}
```

### Transactions Collection
```javascript
{
  id: String (UUID),
  user_id: String,
  crypto_id: String,
  crypto_symbol: String,
  crypto_name: String,
  transaction_type: String (buy/sell),
  quantity: Number,
  price_per_unit: Number,
  total_amount: Number,
  timestamp: String (ISO timestamp)
}
```

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Modern, clean interface with Tailwind CSS
- Interactive components with Radix UI
- Toast notifications for user feedback
- Loading states and error handling
- Color-coded profit/loss indicators (green for gains, red for losses)
- Smooth animations and transitions

## 🔧 Development Features

- Hot reload enabled for both frontend and backend
- Caching for CoinGecko API calls (60-second duration)
- Rate limit handling with graceful fallbacks
- Error logging and debugging support
- TypeScript-style prop validation with PropTypes

## 📝 Important Notes

### Environment Configuration
- **Do not modify** `REACT_APP_BACKEND_URL` in frontend/.env
- **Do not modify** `MONGO_URL` in backend/.env
- These are pre-configured for the container environment
- Backend must always bind to `0.0.0.0:8001`
- All backend routes must be prefixed with `/api`

### Service Management
- Services are managed by Supervisor
- Hot reload is enabled, so most code changes don't require restart
- Only restart services when:
  - Installing new dependencies
  - Modifying environment variables
  - Changing port configurations

### API Rate Limits
- CoinGecko API has rate limits on the free tier
- The application implements caching to minimize API calls
- Rate limit errors (429) are handled gracefully
- Cached data is used when rate limits are exceeded

## 🐛 Troubleshooting

### Docker Issues

#### Containers Not Starting
```bash
# Check container status
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Rebuild containers
docker-compose up -d --build

# Remove and recreate containers
docker-compose down
docker-compose up -d
```

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :8001  # Backend
lsof -i :27017 # MongoDB

# Kill the process or change port in docker-compose.yml
```

#### Database Connection Issues
```bash
# Check if MongoDB container is running
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb

# Connect to MongoDB shell
docker-compose exec mongodb mongosh
```

#### Volume Permission Issues
```bash
# On Linux, if you encounter permission issues:
sudo chown -R $USER:$USER ./

# Or run with sudo
sudo docker-compose up -d
```

#### Cannot Connect to Backend from Frontend
```bash
# Verify backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Test backend directly
curl http://localhost:8001/api/cryptos

# Verify REACT_APP_BACKEND_URL in docker-compose.yml
```

#### Hot Reload Not Working
```bash
# For frontend, ensure volumes are mounted correctly
# On Windows/Mac, might need to enable polling:
# Already configured in docker-compose.yml:
# CHOKIDAR_USEPOLLING=true
# WATCHPACK_POLLING=true
```

### Local Development Issues

#### Backend Not Starting
```bash
# Check backend logs (Supervisor)
tail -n 50 /var/log/supervisor/backend.err.log

# Or check directly if running uvicorn
# Common issues:
# - Missing dependencies: pip install -r requirements.txt
# - MongoDB connection: Verify MONGO_URL in .env
# - Port already in use: Check if another process is using port 8001
```

#### Frontend Not Starting
```bash
# Check frontend logs (Supervisor)
tail -n 50 /var/log/supervisor/frontend.err.log

# Common issues:
# - Missing dependencies: yarn install
# - Port already in use: Check if another process is using port 3000
# - Node version: Ensure Node 16+ is installed
```

#### Database Connection Issues
```bash
# Verify MongoDB is running (local)
sudo systemctl status mongod

# For Docker MongoDB
docker-compose ps mongodb

# Check MongoDB connection string
cat /app/backend/.env | grep MONGO_URL
```

#### API Errors
- **Docker**: Verify backend is running: `docker-compose ps backend`
- **Local**: Verify backend is running: `sudo supervisorctl status backend`
- Check CORS configuration in backend/.env or docker-compose.yml
- Ensure all API routes use `/api` prefix
- Verify authentication token is being sent correctly

### Common Error Messages

#### "Cannot connect to MongoDB"
- Ensure MongoDB container/service is running
- Check MONGO_URL environment variable
- Wait 10-15 seconds after starting MongoDB before starting backend

#### "Port already allocated"
- Another service is using the port
- Stop the conflicting service or change port in docker-compose.yml

#### "Module not found" (Frontend)
- Run `yarn install` or rebuild container: `docker-compose up -d --build frontend`

#### "No module named 'X'" (Backend)
- Run `pip install -r requirements.txt` or rebuild: `docker-compose up -d --build backend`

## 🧪 Testing

The project includes test files for various features:
- `backend_test.py` - Backend API tests
- `buy_sell_test.py` - Buy/sell functionality tests
- `chart_timeframe_test.py` - Chart timeframe tests
- `portfolio_summary_test.py` - Portfolio summary tests

Run tests with:
```bash
cd /app
pytest
```

## 📈 Future Enhancements

Potential features for future development:
- Real-time price updates with WebSockets
- Advanced charting with technical indicators
- Price alerts and notifications
- Trading history charts
- Multi-currency support
- Order book visualization
- Social features (following other traders)
- API key management for personal trading

## 📄 License

This project is part of a development assignment.

## 🤝 Contributing

This is a containerized development environment. Follow the standard Git workflow for contributions.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs for error messages
3. Verify environment configuration
4. Contact the development team

---

**Built with ❤️ using FastAPI, React, and MongoDB**