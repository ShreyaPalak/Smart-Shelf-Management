import requests
from pathlib import Path
import detector

# Fetch a known-valid PNG from httpbin
print("Fetching test image...")
url_img = 'https://httpbin.org/image/png'
resp = requests.get(url_img, timeout=20)
if resp.status_code != 200:
    print('Failed to fetch test image, status', resp.status_code)
    raise SystemExit(1)

img_path = Path('test_real_model.png')
img_path.write_bytes(resp.content)
print(f'Fetched image, size: {img_path.stat().st_size} bytes')

# Run detection
print('\nRunning detection with corrected model...')
proc = detector.DetectionProcessor()
try:
    result = proc.detect_from_image(str(img_path))
    print(f'\n✓ Detection succeeded!')
    print(f'Result type: {type(result)}')
    print(f'Result keys: {list(result.keys())}')
    print(f'\nFull result (first 1000 chars):\n{str(result)[:1000]}')
except Exception as e:
    print(f'\n✗ Detection failed: {e}')
    import traceback
    traceback.print_exc()
finally:
    try:
        img_path.unlink()
    except:
        pass
