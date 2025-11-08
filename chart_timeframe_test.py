#!/usr/bin/env python3

import requests
import time

def test_chart_timeframes():
    """Test chart endpoint with different timeframes"""
    base_url = "https://trade-view-enhance.preview.emergentagent.com"
    api_url = f"{base_url}/api"
    
    print("🔍 Testing Chart Timeframe Endpoints")
    print("=" * 50)
    
    timeframes = ["1", "7", "30", "365"]
    crypto_id = "bitcoin"
    
    for i, days in enumerate(timeframes):
        if i > 0:
            print(f"   Waiting 3 seconds to avoid rate limiting...")
            time.sleep(3)
        
        print(f"\n{i+1}. Testing {days} day(s) chart for {crypto_id}...")
        
        response = requests.get(f"{api_url}/cryptos/{crypto_id}?days={days}")
        
        if response.status_code == 200:
            data = response.json()
            if 'crypto' in data and 'chart' in data:
                crypto_data = data['crypto']
                chart_data = data['chart']
                print(f"✅ {days} days chart successful:")
                print(f"   Crypto: {crypto_data.get('name')}")
                print(f"   Price: ${crypto_data.get('current_price')}")
                print(f"   Chart points: {len(chart_data)}")
            else:
                print(f"❌ {days} days chart - Invalid response structure")
                return False
        elif response.status_code == 503:
            print(f"⚠️  {days} days chart - Rate limited (acceptable)")
        else:
            print(f"❌ {days} days chart failed: {response.status_code} - {response.text}")
            return False
    
    print("\n✅ Chart timeframe tests completed!")
    return True

if __name__ == "__main__":
    success = test_chart_timeframes()
    exit(0 if success else 1)