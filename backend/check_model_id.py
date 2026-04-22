import requests
import json

api_key = "DTS16twTzIANynxoqpU8"
workspace = "ssim"
project = "projects"
version = "2"

# Query API for more details about this version
print(f"=== Checking version details for {workspace}/{project}/{version} ===")
resp = requests.get(
    f"https://api.roboflow.com/{workspace}/{project}/{version}",
    headers={"Authorization": f"Bearer {api_key}"},
    timeout=10
)
print(f"Status: {resp.status_code}")
print(json.dumps(resp.json(), indent=2)[:2000])

# Try listing all versions more carefully
print(f"\n\n=== All versions of {workspace}/{project} ===")
resp = requests.get(
    f"https://api.roboflow.com/{workspace}/{project}",
    headers={"Authorization": f"Bearer {api_key}"},
    timeout=10
)
if resp.status_code == 200:
    data = resp.json()
    if 'versions' in data:
        for v in data['versions']:
            print(f"Version ID: {v.get('id')} - Name: {v.get('name')}")
