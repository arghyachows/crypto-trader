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

- Node.js (v16 or higher)
- Python 3.9+
- MongoDB (local or MongoDB Atlas)
- Yarn package manager

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd /app
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd /app/backend
pip install -r requirements.txt
```

#### Configure Environment Variables
Create or update `/app/backend/.env` file:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=crypto_trading
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=*
```

**Note**: The `MONGO_URL` is pre-configured for the container environment. Do not modify unless you know your MongoDB connection details.

### 3. Frontend Setup

#### Install Node Dependencies
```bash
cd /app/frontend
yarn install
```

#### Configure Environment Variables
The `/app/frontend/.env` file should contain:
```env
REACT_APP_BACKEND_URL=<your-backend-url>
```

**Important**: This URL is pre-configured for production. Do not modify unless necessary.

## 🚀 Running the Application

The application uses Supervisor to manage both frontend and backend services.

### Start All Services
```bash
sudo supervisorctl restart all
```

### Start Individual Services
```bash
# Restart backend only
sudo supervisorctl restart backend

# Restart frontend only
sudo supervisorctl restart frontend
```

### Check Service Status
```bash
sudo supervisorctl status
```

### View Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.*.log

# Frontend logs
tail -f /var/log/supervisor/frontend.*.log
```

## 🌐 Accessing the Application

- **Frontend**: The frontend runs on port 3000 (configured in Supervisor)
- **Backend API**: The backend runs on port 8001 (configured in Supervisor)
- **API Base URL**: All backend routes are prefixed with `/api`

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
│   ├── server.py          # FastAPI application with all routes
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   │   ├── Layout.jsx
│   │   │   ├── TransactionDialog.jsx
│   │   │   └── ui/       # Radix UI components
│   │   ├── pages/        # Page components
│   │   │   ├── AuthPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CryptoList.jsx
│   │   │   ├── CryptoDetail.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   └── Transactions.jsx
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── App.js        # Main app component with routing
│   │   └── index.js      # Application entry point
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend environment variables
├── tests/               # Test files
└── README.md           # This file
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

### Backend Not Starting
```bash
# Check backend logs
tail -n 50 /var/log/supervisor/backend.err.log

# Common issues:
# - Missing dependencies: pip install -r requirements.txt
# - MongoDB connection: Verify MONGO_URL in .env
# - Port already in use: Check if another process is using port 8001
```

### Frontend Not Starting
```bash
# Check frontend logs
tail -n 50 /var/log/supervisor/frontend.err.log

# Common issues:
# - Missing dependencies: yarn install
# - Port already in use: Check if another process is using port 3000
```

### Database Connection Issues
```bash
# Verify MongoDB is running
sudo systemctl status mongod

# Check MongoDB connection string
cat /app/backend/.env | grep MONGO_URL
```

### API Errors
- Verify backend is running: `sudo supervisorctl status backend`
- Check CORS configuration in backend/.env
- Ensure all API routes use `/api` prefix
- Verify authentication token is being sent correctly

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