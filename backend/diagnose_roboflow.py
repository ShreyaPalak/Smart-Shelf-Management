import requests, config, traceback, io
from PIL import Image

base = config.ROBOFLOW_API_URL.rstrip('/')
workspace = config.ROBOFLOW_WORKSPACE
workflow = config.ROBOFLOW_WORKFLOW_ID
key = config.ROBOFLOW_API_KEY

url = f"{base}/{workspace}/{workflow}?api_key={key}"
print('Testing URL:', url)

# 1) Simple GET
try:
    r = requests.get(url, timeout=15)
    print('GET status:', r.status_code)
    print('GET headers:', dict(r.headers))
    print('GET body (first 1000 chars):')
    print(r.text[:1000])
except Exception as e:
    print('GET failed:', type(e).__name__, e)
    traceback.print_exc()

# 2) POST a tiny PNG image as multipart
try:
    # create tiny image in memory
    img = Image.new('RGB', (8,8), color=(255,0,0))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    files = {'image': ('test.png', buf, 'image/png')}
    r2 = requests.post(url, files=files, timeout=30)
    print('\nPOST status:', r2.status_code)
    print('POST headers:', dict(r2.headers))
    print('POST body (first 2000 chars):')
    print(r2.text[:2000])
except Exception as e:
    print('POST failed:', type(e).__name__, e)
    traceback.print_exc()
