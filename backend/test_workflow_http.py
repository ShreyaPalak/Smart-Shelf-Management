import requests
from pathlib import Path
import json

# Fetch test image
print("Fetching test image...")
url_img = 'https://httpbin.org/image/png'
resp = requests.get(url_img, timeout=20)
img_path = Path('test_workflow_http.png')
img_path.write_bytes(resp.content)
print(f'Image saved: {img_path.stat().st_size} bytes')

# Try calling the workflow endpoint directly via HTTP
api_key = "DTS16twTzIANynxoqpU8"
workspace = "ssim"
workflow_id = "detect-count-and-visualize-2"

url = f"https://serverless.roboflow.com/{workspace}/{workflow_id}?api_key={api_key}"
print(f"\nPOST to: {url}")

try:
    with open(str(img_path), 'rb') as fh:
        files = {'file': (img_path.name, fh, 'image/png')}
        resp = requests.post(url, files=files, timeout=60)
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            result = resp.json()
            print(f"✅ SUCCESS!")
            print(f"Result keys: {list(result.keys())}")
            print(f"\nFull result (first 1500 chars):\n{json.dumps(result, indent=2)[:1500]}")
        else:
            print(f"❌ Error: {resp.status_code}")
            print(f"Response: {json.dumps(resp.json(), indent=2) if resp.text else resp.text}")
except Exception as e:
    print(f"❌ Exception: {e}")
finally:
    img_path.unlink()
