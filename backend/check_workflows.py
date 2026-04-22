import requests
import json

api_key = "DTS16twTzIANynxoqpU8"

# Try to fetch workflow information from Roboflow API
urls = [
    f"https://api.roboflow.com/ssim/workflows?api_key={api_key}",
    f"https://api.roboflow.com/workflows?api_key={api_key}",
]

for url in urls:
    print(f"Trying: {url}")
    try:
        resp = requests.get(url, timeout=10)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(json.dumps(data, indent=2)[:1000])
        else:
            print(f"Error response: {resp.text[:500]}")
    except Exception as e:
        print(f"Exception: {e}")
    print()
