import requests
import base64
from pathlib import Path

# Tiny 1x1 PNG (transparent)
png_b64 = (
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
)
img_bytes = base64.b64decode(png_b64)

tmp = Path('test_upload.png')
with tmp.open('wb') as f:
    f.write(img_bytes)

url = 'http://127.0.0.1:5000/api/detect'
files = {'image': ('test_upload.png', tmp.open('rb'), 'image/png')}
try:
    print('Posting to', url)
    resp = requests.post(url, files=files, timeout=30)
    print('Status:', resp.status_code)
    print('Response headers:', resp.headers)
    print('Response body:', resp.text)
except Exception as e:
    print('Error during request:', e)
finally:
    try:
        tmp.unlink()
    except Exception:
        pass
