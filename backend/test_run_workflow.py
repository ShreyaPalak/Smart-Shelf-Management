from inference_sdk import InferenceHTTPClient
import config, traceback

client = InferenceHTTPClient(api_url="https://serverless.roboflow.com", api_key=config.ROBOFLOW_API_KEY)

image_path = r"C:\Users\Shrey\Desktop\SKILLS-UI_LEARN\Smart-Shelf-Management\data\uploads\test.jpg"

try:
    print('Attempting run_workflow with image path...')
    res = client.run_workflow(
        workspace_name=config.ROBOFLOW_WORKSPACE,
        workflow_id=config.ROBOFLOW_WORKFLOW_ID,
        images={"image": image_path},
        use_cache=True
    )
    print('Success:', res)
except Exception as e1:
    print('run_workflow(path) failed:', type(e1).__name__, e1)
    traceback.print_exc()
    try:
        print('Attempting run_workflow with file object...')
        with open(image_path, 'rb') as f:
            res = client.run_workflow(
                workspace_name=config.ROBOFLOW_WORKSPACE,
                workflow_id=config.ROBOFLOW_WORKFLOW_ID,
                images={"image": f},
                use_cache=True
            )
            print('Success (file):', res)
    except Exception as e2:
        print('run_workflow(file) failed:', type(e2).__name__, e2)
        traceback.print_exc()
