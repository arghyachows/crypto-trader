#!/usr/bin/env python3

import requests
import json
import time

def test_portfolio_summary():
    """Focused test for portfolio summary endpoint"""
    base_url = "https://trade-view-enhance.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing Portfolio Summary Endpoint")
    print("=" * 50)
    
    # Register a new user
    timestamp = int(time.time())
    test_user = {
        "name": f"Portfolio Test User {timestamp}",
        "email": f"portfolio_test{timestamp}@example.com",
        "password": "TestPass123!"
    }
    
    print("1. Registering test user...")
    response = requests.post(f"{api_url}/auth/register", json=test_user)
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.text}")
        return False
    
    token = response.json()['access_token']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print("✅ User registered successfully")
    
    # Test empty portfolio summary
    print("\n2. Testing empty portfolio summary...")
    response = requests.get(f"{api_url}/portfolio/summary", headers=headers)
    if response.status_code != 200:
        print(f"❌ Portfolio summary failed: {response.text}")
        return False
    
    summary = response.json()
    print(f"✅ Empty portfolio summary:")
    print(f"   Total Value: ${summary['total_value']}")
    print(f"   Total Invested: ${summary['total_invested']}")
    print(f"   Total Profit: ${summary['total_profit']}")
    print(f"   Profit Percentage: {summary['profit_percentage']}%")
    print(f"   Holdings: {len(summary['holdings'])}")
    print(f"   Top Performers: {len(summary['top_performers'])}")
    print(f"   Top Losers: {len(summary['top_losers'])}")
    
    # Verify empty portfolio structure
    expected_empty = {
        'total_value': 0,
        'total_invested': 0,
        'total_profit': 0,
        'profit_percentage': 0,
        'holdings': [],
        'top_performers': [],
        'top_losers': []
    }
    
    for key, expected_value in expected_empty.items():
        if summary[key] != expected_value:
            print(f"❌ Empty portfolio validation failed for {key}: expected {expected_value}, got {summary[key]}")
            return False
    
    # Buy some crypto
    print("\n3. Buying Bitcoin...")
    buy_request = {
        "crypto_id": "bitcoin",
        "crypto_symbol": "BTC",
        "crypto_name": "Bitcoin",
        "quantity": 0.001,
        "price_per_unit": 50000
    }
    
    response = requests.post(f"{api_url}/portfolio/buy", json=buy_request, headers=headers)
    if response.status_code != 200:
        print(f"❌ Buy failed: {response.text}")
        return False
    
    print("✅ Bitcoin purchase successful")
    
    # Buy another crypto
    print("\n4. Buying Ethereum...")
    buy_request2 = {
        "crypto_id": "ethereum",
        "crypto_symbol": "ETH", 
        "crypto_name": "Ethereum",
        "quantity": 0.01,
        "price_per_unit": 3000
    }
    
    response = requests.post(f"{api_url}/portfolio/buy", json=buy_request2, headers=headers)
    if response.status_code != 200:
        print(f"❌ Ethereum buy failed: {response.text}")
        return False
    
    print("✅ Ethereum purchase successful")
    
    # Test portfolio summary with holdings
    print("\n5. Testing portfolio summary with holdings...")
    response = requests.get(f"{api_url}/portfolio/summary", headers=headers)
    if response.status_code != 200:
        print(f"❌ Portfolio summary with holdings failed: {response.text}")
        return False
    
    summary = response.json()
    print(f"✅ Portfolio summary with holdings:")
    print(f"   Total Value: ${summary['total_value']:.2f}")
    print(f"   Total Invested: ${summary['total_invested']:.2f}")
    print(f"   Total Profit: ${summary['total_profit']:.2f}")
    print(f"   Profit Percentage: {summary['profit_percentage']:.2f}%")
    print(f"   Holdings: {len(summary['holdings'])}")
    print(f"   Top Performers: {len(summary['top_performers'])}")
    print(f"   Top Losers: {len(summary['top_losers'])}")
    
    # Validate holdings structure
    if len(summary['holdings']) != 2:
        print(f"❌ Expected 2 holdings, got {len(summary['holdings'])}")
        return False
    
    # Check required fields in holdings
    required_fields = ['crypto_id', 'crypto_name', 'crypto_symbol', 'quantity', 
                      'average_buy_price', 'current_price', 'total_invested', 
                      'current_value', 'profit', 'profit_percentage']
    
    for holding in summary['holdings']:
        for field in required_fields:
            if field not in holding:
                print(f"❌ Missing field '{field}' in holding")
                return False
        print(f"   Holding: {holding['crypto_name']} - {holding['quantity']} units - Profit: {holding['profit_percentage']:.2f}%")
    
    # Validate calculations
    expected_invested = 50000 * 0.001 + 3000 * 0.01  # 50 + 30 = 80
    if abs(summary['total_invested'] - expected_invested) > 0.01:
        print(f"❌ Total invested calculation wrong: expected {expected_invested}, got {summary['total_invested']}")
        return False
    
    print("✅ All portfolio summary tests passed!")
    return True

if __name__ == "__main__":
    success = test_portfolio_summary()
    exit(0 if success else 1)