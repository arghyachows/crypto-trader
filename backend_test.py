#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class CryptoAppTester:
    def __init__(self, base_url="https://trade-view-enhance.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_user = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            print(f"   Registered user: {self.user_data['email']}")
            print(f"   Starting balance: ${self.user_data['balance']}")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        if not self.user_data:
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            print(f"   User ID: {response.get('id')}")
            print(f"   Email: {response.get('email')}")
            print(f"   Balance: ${response.get('balance')}")
            return True
        return False

    def test_get_cryptos(self):
        """Test getting cryptocurrency list"""
        success, response = self.run_test(
            "Get Cryptocurrencies",
            "GET",
            "cryptos",
            200
        )
        
        if success and isinstance(response, list) and len(response) > 0:
            print(f"   Found {len(response)} cryptocurrencies")
            print(f"   First crypto: {response[0].get('name')} ({response[0].get('symbol')})")
            print(f"   Price: ${response[0].get('current_price')}")
            return True, response
        return False, []

    def test_search_cryptos(self):
        """Test cryptocurrency search"""
        success, response = self.run_test(
            "Search Cryptocurrencies (Bitcoin)",
            "GET",
            "cryptos?search=bitcoin",
            200
        )
        
        if success and isinstance(response, list):
            bitcoin_found = any(crypto.get('name', '').lower() == 'bitcoin' for crypto in response)
            if bitcoin_found:
                print(f"   Bitcoin found in search results")
                return True
            else:
                self.log_test("Search Cryptocurrencies (Bitcoin)", False, "Bitcoin not found in search")
                return False
        return False

    def test_crypto_details(self, crypto_id="bitcoin"):
        """Test getting cryptocurrency details"""
        success, response = self.run_test(
            f"Get Crypto Details ({crypto_id})",
            "GET",
            f"cryptos/{crypto_id}",
            200
        )
        
        if success and 'crypto' in response and 'chart' in response:
            crypto_data = response['crypto']
            chart_data = response['chart']
            print(f"   Crypto: {crypto_data.get('name')}")
            print(f"   Price: ${crypto_data.get('current_price')}")
            print(f"   Chart points: {len(chart_data)}")
            return True, crypto_data
        return False, {}

    def test_buy_crypto(self, crypto_data):
        """Test buying cryptocurrency"""
        if not crypto_data:
            return False
            
        buy_request = {
            "crypto_id": crypto_data.get('id'),
            "crypto_symbol": crypto_data.get('symbol', '').upper(),
            "crypto_name": crypto_data.get('name'),
            "quantity": 0.001,  # Small amount for testing
            "price_per_unit": crypto_data.get('current_price')
        }
        
        success, response = self.run_test(
            "Buy Cryptocurrency",
            "POST",
            "portfolio/buy",
            200,
            data=buy_request
        )
        
        if success and 'new_balance' in response:
            print(f"   New balance: ${response['new_balance']}")
            return True
        return False

    def test_get_portfolio(self):
        """Test getting user portfolio"""
        success, response = self.run_test(
            "Get Portfolio",
            "GET",
            "portfolio",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Portfolio items: {len(response)}")
            if len(response) > 0:
                item = response[0]
                print(f"   First holding: {item.get('crypto_name')} - {item.get('quantity')} units")
            return True, response
        return False, []

    def test_sell_crypto(self, portfolio):
        """Test selling cryptocurrency"""
        if not portfolio or len(portfolio) == 0:
            self.log_test("Sell Cryptocurrency", False, "No portfolio items to sell")
            return False
            
        item = portfolio[0]
        sell_quantity = min(item.get('quantity', 0) * 0.5, 0.0005)  # Sell half or small amount
        
        if sell_quantity <= 0:
            self.log_test("Sell Cryptocurrency", False, "No quantity to sell")
            return False
        
        sell_request = {
            "crypto_id": item.get('crypto_id'),
            "crypto_symbol": item.get('crypto_symbol'),
            "crypto_name": item.get('crypto_name'),
            "quantity": sell_quantity,
            "price_per_unit": 50000  # Use a reasonable price for testing
        }
        
        success, response = self.run_test(
            "Sell Cryptocurrency",
            "POST",
            "portfolio/sell",
            200,
            data=sell_request
        )
        
        if success and 'new_balance' in response:
            print(f"   New balance after sale: ${response['new_balance']}")
            return True
        return False

    def test_get_transactions(self):
        """Test getting transaction history"""
        success, response = self.run_test(
            "Get Transactions",
            "GET",
            "transactions",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Transaction count: {len(response)}")
            if len(response) > 0:
                tx = response[0]
                print(f"   Latest: {tx.get('transaction_type')} {tx.get('crypto_name')} - ${tx.get('total_amount')}")
            return True
        return False

    def test_portfolio_summary_empty(self):
        """Test portfolio summary with empty portfolio"""
        success, response = self.run_test(
            "Portfolio Summary (Empty)",
            "GET",
            "portfolio/summary",
            200
        )
        
        if success:
            expected_fields = ['total_value', 'total_invested', 'total_profit', 'profit_percentage', 'holdings', 'top_performers', 'top_losers']
            missing_fields = [field for field in expected_fields if field not in response]
            
            if missing_fields:
                self.log_test("Portfolio Summary (Empty)", False, f"Missing fields: {missing_fields}")
                return False
            
            # Check empty portfolio values
            if (response['total_value'] == 0 and response['total_invested'] == 0 and 
                response['total_profit'] == 0 and response['profit_percentage'] == 0 and
                len(response['holdings']) == 0 and len(response['top_performers']) == 0 and
                len(response['top_losers']) == 0):
                print(f"   Empty portfolio correctly returned zeros")
                return True
            else:
                self.log_test("Portfolio Summary (Empty)", False, "Empty portfolio should have all zero values")
                return False
        return False

    def test_portfolio_summary_with_holdings(self):
        """Test portfolio summary with holdings"""
        success, response = self.run_test(
            "Portfolio Summary (With Holdings)",
            "GET",
            "portfolio/summary",
            200
        )
        
        if success:
            expected_fields = ['total_value', 'total_invested', 'total_profit', 'profit_percentage', 'holdings', 'top_performers', 'top_losers']
            missing_fields = [field for field in expected_fields if field not in response]
            
            if missing_fields:
                self.log_test("Portfolio Summary (With Holdings)", False, f"Missing fields: {missing_fields}")
                return False
            
            print(f"   Total Value: ${response.get('total_value', 0):.2f}")
            print(f"   Total Invested: ${response.get('total_invested', 0):.2f}")
            print(f"   Total Profit: ${response.get('total_profit', 0):.2f}")
            print(f"   Profit Percentage: {response.get('profit_percentage', 0):.2f}%")
            print(f"   Holdings: {len(response.get('holdings', []))}")
            print(f"   Top Performers: {len(response.get('top_performers', []))}")
            print(f"   Top Losers: {len(response.get('top_losers', []))}")
            
            # Validate holdings structure
            holdings = response.get('holdings', [])
            if holdings:
                holding = holdings[0]
                required_holding_fields = ['crypto_id', 'crypto_name', 'crypto_symbol', 'quantity', 
                                         'average_buy_price', 'current_price', 'total_invested', 
                                         'current_value', 'profit', 'profit_percentage']
                missing_holding_fields = [field for field in required_holding_fields if field not in holding]
                
                if missing_holding_fields:
                    self.log_test("Portfolio Summary (With Holdings)", False, f"Missing holding fields: {missing_holding_fields}")
                    return False
                
                print(f"   First holding: {holding.get('crypto_name')} - Profit: {holding.get('profit_percentage', 0):.2f}%")
            
            # Validate top performers/losers are sorted correctly
            top_performers = response.get('top_performers', [])
            if len(top_performers) > 1:
                for i in range(len(top_performers) - 1):
                    if top_performers[i]['profit_percentage'] < top_performers[i + 1]['profit_percentage']:
                        self.log_test("Portfolio Summary (With Holdings)", False, "Top performers not sorted correctly")
                        return False
            
            return True
        return False

    def test_chart_timeframes(self, crypto_id="bitcoin"):
        """Test chart endpoint with different timeframes"""
        timeframes = ["1", "7", "30", "365"]
        all_success = True
        
        for days in timeframes:
            success, response = self.run_test(
                f"Chart Data ({days} days)",
                "GET",
                f"cryptos/{crypto_id}?days={days}",
                200
            )
            
            if success and 'crypto' in response and 'chart' in response:
                crypto_data = response['crypto']
                chart_data = response['chart']
                print(f"   {days} days - Crypto: {crypto_data.get('name')}, Chart points: {len(chart_data)}")
            else:
                all_success = False
                
        return all_success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_login = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_login
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (Should Fail)",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Crypto Investment App Backend Tests")
        print(f"📍 Testing API at: {self.api_url}")
        print("=" * 60)

        # Authentication Tests
        print("\n📋 AUTHENTICATION TESTS")
        if not self.test_user_registration():
            print("❌ Registration failed - stopping tests")
            return False

        self.test_user_login()
        self.test_get_user_profile()
        self.test_invalid_login()
        self.test_unauthorized_access()

        # Crypto Data Tests
        print("\n📋 CRYPTOCURRENCY DATA TESTS")
        crypto_success, cryptos = self.test_get_cryptos()
        if not crypto_success:
            print("❌ Failed to fetch cryptos - stopping market tests")
            return False

        self.test_search_cryptos()
        
        # Get Bitcoin details for trading tests
        crypto_detail_success, crypto_data = self.test_crypto_details("bitcoin")

        # Trading Tests
        print("\n📋 TRADING TESTS")
        if crypto_detail_success:
            buy_success = self.test_buy_crypto(crypto_data)
            
            if buy_success:
                portfolio_success, portfolio = self.test_get_portfolio()
                if portfolio_success:
                    self.test_sell_crypto(portfolio)
                    self.test_get_transactions()
            else:
                print("❌ Buy test failed - skipping sell tests")
        else:
            print("❌ Crypto details test failed - skipping trading tests")

        # Final Results
        print("\n" + "=" * 60)
        print(f"📊 TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   - {result['test']}: {result['details']}")
            return False

def main():
    tester = CryptoAppTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())