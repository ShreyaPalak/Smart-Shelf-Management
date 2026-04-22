import requests
from pathlib import Path
import detector

# Fetch a known-valid PNG from httpbin
url_img = 'https://httpbin.org/image/png'
resp = requests.get(url_img, timeout=20)
if resp.status_code != 200:
    print('Failed to fetch test image, status', resp.status_code)
    raise SystemExit(1)

img_path = Path('fetched_test.png')
img_path.write_bytes(resp.content)
print('Fetched image size:', img_path.stat().st_size)

# Monkeypatch requests.post to print outgoing
original_post = requests.post

def printing_post(url, *args, **kwargs):
    print('---OUTGOING POST CALL---')
    print('URL:', url)
    files = kwargs.get('files')
    if files:
        print('Files keys:', list(files.keys()))
        for k,v in files.items():
            try:
                filename = v[0]
            except Exception:
                filename = getattr(v, 'name', str(v))
            print(f"part '{k}': filename -> {filename}")
    print('Other kwargs keys:', list(kwargs.keys()))
    resp = original_post(url, *args, **kwargs)
    print('RESPONSE STATUS:', resp.status_code)
    try:
        print('RESPONSE JSON:', resp.json())
    except Exception:
        print('RESPONSE TEXT:', resp.text[:500])
    return resp

requests.post = printing_post

proc = detector.DetectionProcessor()
print('Calling detect_from_image with', img_path)
try:
    res = proc.detect_from_image(str(img_path))
    print('Detect returned type:', type(res))
except Exception as e:
    print('Error from detect:', e)

# cleanup
try:
    img_path.unlink()
except Exception:
    pass
