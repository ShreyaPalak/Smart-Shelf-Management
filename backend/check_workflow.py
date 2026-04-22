import requests
import json

api_key = "DTS16twTzIANynxoqpU8"
workspace = "ssim"

# Try to list workflows via Roboflow API (if available)
urls_to_try = [
    f"https://api.roboflow.com/v1/projects?api_key={api_key}",
    f"https://api.roboflow.com/workspaces?api_key={api_key}",
]

for url in urls_to_try:
    print(f"\nTrying: {url}")
    try:
        resp = requests.get(url, timeout=10)
        print(f"Status: {resp.status_code}")
        try:
            print("Response:", json.dumps(resp.json(), indent=2)[:500])
        except:
            print("Response (text):", resp.text[:500])
    except Exception as e:
        print(f"Error: {e}")

# Also try the serverless endpoint with a simple test
print("\n\n--- Serverless endpoint test ---")
url = f"https://serverless.roboflow.com/{workspace}/detect-count-and-visualize?api_key={api_key}"
print(f"Endpoint: {url}")

# POST with just a content-type to see if workflow exists
resp = requests.post(url, json={}, timeout=10)
print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")
