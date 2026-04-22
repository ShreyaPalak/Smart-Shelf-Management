from inference_sdk import InferenceHTTPClient
import requests
from pathlib import Path

# Fetch a test image
print("Fetching test image...")
url_img = 'https://httpbin.org/image/png'
resp = requests.get(url_img, timeout=20)
img_path = Path('test_workflow.png')
img_path.write_bytes(resp.content)
print(f'Image saved: {img_path.stat().st_size} bytes')

# Test the correct workflow
client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="DTS16twTzIANynxoqpU8"
)

print("\nTesting workflow: detect-count-and-visualize-2")
try:
    result = client.run_workflow(
        workspace_name="ssim",
        workflow_id="detect-count-and-visualize-2",
        images={
            "image": str(img_path)
        },
        use_cache=True
    )
    print("✅ Workflow succeeded!")
    print(f"Result type: {type(result)}")
    print(f"Result keys: {list(result.keys()) if isinstance(result, dict) else 'list/other'}")
    print(f"\nFirst 500 chars of result:\n{str(result)[:500]}")
except Exception as e:
    print(f"❌ Workflow failed: {e}")
    import traceback
    traceback.print_exc()
finally:
    img_path.unlink()
