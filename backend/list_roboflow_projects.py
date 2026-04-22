import requests
import json

api_key = "DTS16twTzIANynxoqpU8"

# List all workspaces
print("=== Listing workspaces ===")
resp = requests.get(
    f"https://api.roboflow.com/workspaces",
    headers={"Authorization": f"Bearer {api_key}"},
    timeout=10
)
print(f"Status: {resp.status_code}")
print(json.dumps(resp.json(), indent=2)[:1000])

# Try to list projects in workspace 'ssim' directly
print("\n\n=== Listing projects in ssim workspace ===")
resp = requests.get(
    f"https://api.roboflow.com/ssim/projects",
    headers={"Authorization": f"Bearer {api_key}"},
    timeout=10
)
print(f"Status: {resp.status_code}")
try:
    print(json.dumps(resp.json(), indent=2)[:1500])
except:
    print("Response text:", resp.text[:500])
