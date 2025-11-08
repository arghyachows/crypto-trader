#!/usr/bin/env python3

import requests
import time

def test_buy_sell_flow():
    """Test complete buy/sell flow"""
    base_url = "https://responsive-makeover-8.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing Buy/Sell Flow")
    print("=" * 50)
    
    # Register user
    timestamp = int(time.time())
    test_user = {
        "name": f"Trade Test User {timestamp}",
        "email": f"trade_test{timestamp}@example.com",
        "password": "TestPass123!"
    }
    
    print("1. Registering test user...")
    response = requests.post(f"{api_url}/auth/register", json=test_user)
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.text}")
        return False
    
    token = response.json()['access_token']
    user_data = response.json()['user']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    print(f"✅ User registered - Starting balance: ${user_data['balance']}")
    
    # Buy crypto
    print("\n2. Buying Bitcoin...")
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
    
    buy_result = response.json()
    print(f"✅ Buy successful - New balance: ${buy_result['new_balance']}")
    
    # Check portfolio
    print("\n3. Checking portfolio...")
    response = requests.get(f"{api_url}/portfolio", headers=headers)
    if response.status_code != 200:
        print(f"❌ Portfolio check failed: {response.text}")
        return False
    
    portfolio = response.json()
    if len(portfolio) != 1:
        print(f"❌ Expected 1 portfolio item, got {len(portfolio)}")
        return False
    
    holding = portfolio[0]
    print(f"✅ Portfolio check - Holding: {holding['crypto_name']} - {holding['quantity']} units")
    
    # Sell partial
    print("\n4. Selling partial Bitcoin...")
    sell_request = {
        "crypto_id": "bitcoin",
        "crypto_symbol": "BTC",
        "crypto_name": "Bitcoin",
        "quantity": 0.0005,  # Sell half
        "price_per_unit": 55000  # Higher price for profit
    }
    
    response = requests.post(f"{api_url}/portfolio/sell", json=sell_request, headers=headers)
    if response.status_code != 200:
        print(f"❌ Sell failed: {response.text}")
        return False
    
    sell_result = response.json()
    print(f"✅ Sell successful - New balance: ${sell_result['new_balance']}")
    
    # Check portfolio after sell
    print("\n5. Checking portfolio after sell...")
    response = requests.get(f"{api_url}/portfolio", headers=headers)
    if response.status_code != 200:
        print(f"❌ Portfolio check after sell failed: {response.text}")
        return False
    
    portfolio = response.json()
    if len(portfolio) != 1:
        print(f"❌ Expected 1 portfolio item after partial sell, got {len(portfolio)}")
        return False
    
    holding = portfolio[0]
    expected_quantity = 0.0005  # Should have 0.0005 left
    if abs(holding['quantity'] - expected_quantity) > 0.0001:
        print(f"❌ Quantity mismatch: expected {expected_quantity}, got {holding['quantity']}")
        return False
    
    print(f"✅ Portfolio after sell - Remaining: {holding['quantity']} units")
    
    # Check transactions
    print("\n6. Checking transaction history...")
    response = requests.get(f"{api_url}/transactions", headers=headers)
    if response.status_code != 200:
        print(f"❌ Transaction history failed: {response.text}")
        return False
    
    transactions = response.json()
    if len(transactions) != 2:
        print(f"❌ Expected 2 transactions, got {len(transactions)}")
        return False
    
    # Transactions should be sorted by timestamp desc (newest first)
    sell_tx = transactions[0]
    buy_tx = transactions[1]
    
    if sell_tx['transaction_type'] != 'sell' or buy_tx['transaction_type'] != 'buy':
        print(f"❌ Transaction order wrong: {[tx['transaction_type'] for tx in transactions]}")
        return False
    
    print(f"✅ Transaction history - Buy: ${buy_tx['total_amount']}, Sell: ${sell_tx['total_amount']}")
    
    print("\n✅ All buy/sell tests passed!")
    return True

if __name__ == "__main__":
    success = test_buy_sell_flow()
    exit(0 if success else 1)