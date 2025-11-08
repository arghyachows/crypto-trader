from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
from decimal import Decimal
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 24  # hours

security = HTTPBearer()

# Cache for CoinGecko API calls
crypto_cache: Dict[str, dict] = {}
cache_timestamps: Dict[str, datetime] = {}
CACHE_DURATION = 60  # seconds

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    balance: float = 10000.0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    balance: float

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class Crypto(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    symbol: str
    name: str
    image: str
    current_price: float
    price_change_24h: float
    price_change_percentage_24h: float
    market_cap: float
    market_cap_rank: int
    total_volume: float

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    crypto_id: str
    crypto_symbol: str
    crypto_name: str
    transaction_type: str  # "buy" or "sell"
    quantity: float
    price_per_unit: float
    total_amount: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Portfolio(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    crypto_id: str
    crypto_symbol: str
    crypto_name: str
    quantity: float
    average_buy_price: float
    total_invested: float

class BuySellRequest(BaseModel):
    crypto_id: str
    crypto_symbol: str
    crypto_name: str
    quantity: float
    price_per_unit: float

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION)
    payload = {
        "user_id": user_id,
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    user_dict = user.model_dump()
    user_dict["password"] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token(user.id)
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            balance=user.balance
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(user["id"])
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            balance=user["balance"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        balance=current_user["balance"]
    )

# Crypto Routes
@api_router.get("/cryptos", response_model=List[Crypto])
async def get_cryptos(search: Optional[str] = None):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 100,
                "page": 1,
                "sparkline": "false"
            }
            response = await client.get(
                "https://api.coingecko.com/api/v3/coins/markets",
                params=params
            )
            data = response.json()
            
            cryptos = []
            for item in data:
                crypto = Crypto(
                    id=item["id"],
                    symbol=item["symbol"].upper(),
                    name=item["name"],
                    image=item["image"],
                    current_price=item["current_price"],
                    price_change_24h=item.get("price_change_24h", 0),
                    price_change_percentage_24h=item.get("price_change_percentage_24h", 0),
                    market_cap=item["market_cap"],
                    market_cap_rank=item["market_cap_rank"],
                    total_volume=item["total_volume"]
                )
                cryptos.append(crypto)
            
            # Filter by search if provided
            if search:
                search_lower = search.lower()
                cryptos = [c for c in cryptos if search_lower in c.name.lower() or search_lower in c.symbol.lower()]
            
            return cryptos
    except Exception as e:
        logger.error(f"Error fetching cryptos: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cryptocurrency data")

@api_router.get("/cryptos/{crypto_id}")
async def get_crypto_details(crypto_id: str):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get current price and basic info
            response = await client.get(
                f"https://api.coingecko.com/api/v3/coins/markets",
                params={
                    "vs_currency": "usd",
                    "ids": crypto_id
                }
            )
            data = response.json()
            if not data:
                raise HTTPException(status_code=404, detail="Cryptocurrency not found")
            
            # Get historical chart data (7 days)
            chart_response = await client.get(
                f"https://api.coingecko.com/api/v3/coins/{crypto_id}/market_chart",
                params={
                    "vs_currency": "usd",
                    "days": "7"
                }
            )
            chart_data = chart_response.json()
            
            return {
                "crypto": data[0],
                "chart": chart_data.get("prices", [])
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching crypto details: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cryptocurrency details")

# Portfolio Routes
@api_router.post("/portfolio/buy")
async def buy_crypto(request: BuySellRequest, current_user: dict = Depends(get_current_user)):
    total_cost = request.quantity * request.price_per_unit
    
    # Check if user has enough balance
    if current_user["balance"] < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Update user balance
    new_balance = current_user["balance"] - total_cost
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"balance": new_balance}}
    )
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user["id"],
        crypto_id=request.crypto_id,
        crypto_symbol=request.crypto_symbol,
        crypto_name=request.crypto_name,
        transaction_type="buy",
        quantity=request.quantity,
        price_per_unit=request.price_per_unit,
        total_amount=total_cost
    )
    await db.transactions.insert_one(transaction.model_dump())
    
    # Update or create portfolio entry
    portfolio_entry = await db.portfolios.find_one({
        "user_id": current_user["id"],
        "crypto_id": request.crypto_id
    }, {"_id": 0})
    
    if portfolio_entry:
        # Update existing position
        new_quantity = portfolio_entry["quantity"] + request.quantity
        new_total_invested = portfolio_entry["total_invested"] + total_cost
        new_avg_price = new_total_invested / new_quantity
        
        await db.portfolios.update_one(
            {"user_id": current_user["id"], "crypto_id": request.crypto_id},
            {"$set": {
                "quantity": new_quantity,
                "total_invested": new_total_invested,
                "average_buy_price": new_avg_price
            }}
        )
    else:
        # Create new position
        portfolio = Portfolio(
            user_id=current_user["id"],
            crypto_id=request.crypto_id,
            crypto_symbol=request.crypto_symbol,
            crypto_name=request.crypto_name,
            quantity=request.quantity,
            average_buy_price=request.price_per_unit,
            total_invested=total_cost
        )
        await db.portfolios.insert_one(portfolio.model_dump())
    
    return {"message": "Purchase successful", "new_balance": new_balance}

@api_router.post("/portfolio/sell")
async def sell_crypto(request: BuySellRequest, current_user: dict = Depends(get_current_user)):
    # Check if user has this crypto in portfolio
    portfolio_entry = await db.portfolios.find_one({
        "user_id": current_user["id"],
        "crypto_id": request.crypto_id
    }, {"_id": 0})
    
    if not portfolio_entry or portfolio_entry["quantity"] < request.quantity:
        raise HTTPException(status_code=400, detail="Insufficient crypto balance")
    
    total_sale = request.quantity * request.price_per_unit
    
    # Update user balance
    new_balance = current_user["balance"] + total_sale
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"balance": new_balance}}
    )
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user["id"],
        crypto_id=request.crypto_id,
        crypto_symbol=request.crypto_symbol,
        crypto_name=request.crypto_name,
        transaction_type="sell",
        quantity=request.quantity,
        price_per_unit=request.price_per_unit,
        total_amount=total_sale
    )
    await db.transactions.insert_one(transaction.model_dump())
    
    # Update portfolio
    new_quantity = portfolio_entry["quantity"] - request.quantity
    
    if new_quantity > 0:
        # Calculate new total invested proportionally
        proportion_sold = request.quantity / portfolio_entry["quantity"]
        new_total_invested = portfolio_entry["total_invested"] * (1 - proportion_sold)
        
        await db.portfolios.update_one(
            {"user_id": current_user["id"], "crypto_id": request.crypto_id},
            {"$set": {
                "quantity": new_quantity,
                "total_invested": new_total_invested
            }}
        )
    else:
        # Remove from portfolio
        await db.portfolios.delete_one({
            "user_id": current_user["id"],
            "crypto_id": request.crypto_id
        })
    
    return {"message": "Sale successful", "new_balance": new_balance}

@api_router.get("/portfolio")
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    portfolios = await db.portfolios.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return portfolios

@api_router.get("/transactions")
async def get_transactions(current_user: dict = Depends(get_current_user)):
    transactions = await db.transactions.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    return transactions

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()