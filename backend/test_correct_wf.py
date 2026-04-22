import requests
from pathlib import Path
import json

# Fetch test image
print("Fetching test image...")
url_img = 'https://httpbin.org/image/png'
resp = requests.get(url_img, timeout=20)
img_path = Path('test_correct_wf.png')
img_path.write_bytes(resp.content)
print(f'Image saved: {img_path.stat().st_size} bytes')

# Call with the CORRECT workflow ID (without -2)
api_key = "DTS16twTzIANynxoqpU8"
workspace = "ssim"
workflow_id = "detect-count-and-visualize"  # Without the -2

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
            # Pretty print first 2000 chars
            result_str = json.dumps(result, indent=2)
            print(f"\nFull result (first 2000 chars):\n{result_str[:2000]}")
        else:
            print(f"❌ Error: {resp.status_code}")
            try:
                print(f"Response: {json.dumps(resp.json(), indent=2)}")
            except:
                print(f"Response text: {resp.text}")
except Exception as e:
    print(f"❌ Exception: {e}")
    import traceback
    traceback.print_exc()
finally:
    img_path.unlink()
