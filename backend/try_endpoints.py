import requests
from pathlib import Path
import json

# Fetch test image
print("Fetching test image...")
url_img = 'https://httpbin.org/image/png'
resp = requests.get(url_img, timeout=20)
img_path = Path('test_post.png')
img_path.write_bytes(resp.content)
print(f'Image size: {img_path.stat().st_size} bytes')

# Try POST to the project version endpoint
api_key = "DTS16twTzIANynxoqpU8"
workspace = "ssim"
project = "projects"
version = "2"

# Try different endpoint formats
urls = [
    f"https://serverless.roboflow.com/{workspace}/{project}/{version}?api_key={api_key}",
    f"https://api.roboflow.com/{workspace}/{project}/{version}/predict?api_key={api_key}",
]

for url in urls:
    print(f"\n\nTrying POST to: {url}")
    try:
        with open(str(img_path), 'rb') as fh:
            files = {'file': fh}
            resp = requests.post(url, files=files, timeout=10)
            print(f"Status: {resp.status_code}")
            print(f"Response: {json.dumps(resp.json(), indent=2) if resp.text else '(empty)'}")
    except Exception as e:
        print(f"Error: {e}")

img_path.unlink()
