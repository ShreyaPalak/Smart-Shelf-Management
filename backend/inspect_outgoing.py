import base64
from pathlib import Path
import requests
import detector

# Create tiny PNG
png_b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII='
img_bytes = base64.b64decode(png_b64)
img_path = Path('inspect_test.png')
img_path.write_bytes(img_bytes)

# Monkeypatch requests.post to inspect args
original_post = requests.post

def printing_post(url, *args, **kwargs):
    print('---OUTGOING POST CALL---')
    print('URL:', url)
    if 'files' in kwargs:
        files = kwargs['files']
    elif len(args) > 0:
        files = args[0]
    else:
        files = None
    if files:
        print('Files keys:', list(files.keys()))
        for k,v in files.items():
            try:
                filename = v[0]
            except Exception:
                filename = getattr(v, 'name', str(v))
            print(f"part '{k}': filename -> {filename}")
    print('Other kwargs keys:', list(kwargs.keys()))
    # call original
    resp = original_post(url, *args, **kwargs)
    print('RESPONSE STATUS:', resp.status_code)
    try:
        print('RESPONSE JSON:', resp.json())
    except Exception:
        print('RESPONSE TEXT:', resp.text)
    return resp

requests.post = printing_post

proc = detector.DetectionProcessor()
print('Calling detect_from_image with', img_path)
try:
    res = proc.detect_from_image(str(img_path))
    print('Detect returned:', type(res))
except Exception as e:
    print('Error from detect:', e)

# cleanup
try:
    img_path.unlink()
except Exception:
    pass
