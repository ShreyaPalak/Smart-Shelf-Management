"""
Test script for the inventory backend system
Run this to verify everything is working correctly
"""

import sys
import requests
import json
from datetime import datetime

API_BASE = 'http://localhost:5000/api'

def test_health():
    """Test if server is running"""
    print("\n1. Testing server health...")
    try:
        response = requests.get(f'{API_BASE}/health')
        if response.status_code == 200:
            print("✓ Server is running")
            return True
        else:
            print("✗ Server responded with error")
            return False
    except Exception as e:
        print(f"✗ Cannot connect to server: {e}")
        print("Make sure the server is running: python app.py")
        return False

def test_create_category():
    """Test creating a product category"""
    print("\n2. Testing category creation...")
    try:
        data = {
            "name": "Test Product",
            "description": "Test product for demo",
            "low_stock_threshold": 5
        }
        response = requests.post(f'{API_BASE}/categories', json=data)
        if response.status_code == 200:
            print("✓ Category created successfully")
            return True
        else:
            print(f"✗ Failed to create category: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_get_categories():
    """Test getting all categories"""
    print("\n3. Testing get categories...")
    try:
        response = requests.get(f'{API_BASE}/categories')
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Found {len(data['categories'])} categories")
            for cat in data['categories']:
                print(f"  - {cat['name']} (threshold: {cat['low_stock_threshold']})")
            return True
        else:
            print(f"✗ Failed to get categories")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_detection_simulation():
    """Simulate a detection (without actual image)"""
    print("\n4. Simulating detection (manual data insert)...")
    print("Note: For actual image detection, use the /api/detect endpoint with an image file")
    
    # This would normally come from YOLO detection
    print("""
    To test with real detection, use:
    
    curl -X POST http://localhost:5000/api/detect \\
         -F "image=@path/to/your/image.jpg"
    
    Or use the frontend upload component
    """)
    return True

def test_inventory():
    """Test getting current inventory"""
    print("\n5. Testing inventory endpoint...")
    try:
        response = requests.get(f'{API_BASE}/inventory/current')
        if response.status_code == 200:
            data = response.json()
            if len(data['inventory']) > 0:
                print(f"✓ Found {len(data['inventory'])} items in inventory")
                for item in data['inventory']:
                    print(f"  - {item['category']}: {item['count']} items ({item['status']})")
            else:
                print("✓ Inventory is empty (no detections yet)")
            return True
        else:
            print(f"✗ Failed to get inventory")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_alerts():
    """Test getting alerts"""
    print("\n6. Testing alerts endpoint...")
    try:
        response = requests.get(f'{API_BASE}/alerts')
        if response.status_code == 200:
            data = response.json()
            if len(data['alerts']) > 0:
                print(f"✓ Found {len(data['alerts'])} active alerts")
                for alert in data['alerts']:
                    print(f"  - {alert['category']}: {alert['message']}")
            else:
                print("✓ No active alerts")
            return True
        else:
            print(f"✗ Failed to get alerts")
            return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def display_api_examples():
    """Show example API calls"""
    print("\n" + "="*60)
    print("API USAGE EXAMPLES")
    print("="*60)
    
    print("""
1. Upload and detect objects:
   curl -X POST http://localhost:5000/api/detect \\
        -F "image=@shelf_photo.jpg"

2. Get current inventory:
   curl http://localhost:5000/api/inventory/current

3. Get inventory history (last 24 hours):
   curl "http://localhost:5000/api/inventory/history?hours=24"

4. Get depletion trends:
   curl "http://localhost:5000/api/inventory/trends?hours=24"

5. Get active alerts:
   curl http://localhost:5000/api/alerts

6. Create a new product category:
   curl -X POST http://localhost:5000/api/categories \\
        -H "Content-Type: application/json" \\
        -d '{"name": "Coca Cola", "low_stock_threshold": 10}'

7. Resolve an alert:
   curl -X POST http://localhost:5000/api/alerts/1/resolve
    """)

def main():
    print("="*60)
    print("INVENTORY BACKEND TEST SUITE")
    print("="*60)
    
    # Run tests
    results = []
    results.append(("Server Health", test_health()))
    
    if not results[0][1]:
        print("\n❌ Server is not running. Please start it first:")
        print("   cd backend")
        print("   python app.py")
        sys.exit(1)
    
    results.append(("Create Category", test_create_category()))
    results.append(("Get Categories", test_get_categories()))
    results.append(("Detection Info", test_detection_simulation()))
    results.append(("Get Inventory", test_inventory()))
    results.append(("Get Alerts", test_alerts()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{name}: {status}")
    
    passed_count = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed_count}/{len(results)} tests passed")
    
    if passed_count == len(results):
        print("\n✓ All tests passed! Backend is ready to use.")
    
    # Show API examples
    display_api_examples()

if __name__ == '__main__':
    main()