from datetime import datetime
from typing import Dict, List, Any
import config
import requests
import os


class DetectionProcessor:
    """Process detection results and extract structured data."""

    def __init__(self):
        # Try to initialize the SDK client if available; otherwise continue without it
        try:
            from inference_sdk import InferenceHTTPClient
            self.client = InferenceHTTPClient(api_url=config.ROBOFLOW_API_URL, api_key=config.ROBOFLOW_API_KEY)
        except Exception:
            self.client = None

    def detect_from_image(self, image_path: str) -> Dict[str, Any]:
        """
        Run detection on an image and return structured results.

        If `USE_MOCK_DETECTION` is True in `config`, returns mock predictions.
        Otherwise attempts an HTTP POST to the configured Roboflow workflow.
        """
        if getattr(config, 'USE_MOCK_DETECTION', True):
            print('[DetectionProcessor] Returning mock detections (USE_MOCK_DETECTION=True)')
            return self._get_mock_detections()

        # Prefer SDK infer if available and supports model/workflow (best-effort)
        if self.client is not None and hasattr(self.client, 'infer'):
            try:
                # Some SDKs accept a model/workflow identifier; try workspace/workflow
                model_ident = getattr(config, 'ROBOFLOW_MODEL_ID', None)
                if model_ident:
                    print(f'[DetectionProcessor] Attempting SDK infer with model_id: {model_ident}')
                    return self.client.infer(image_path, model_id=model_ident)
            except Exception as e:
                print(f'[DetectionProcessor] SDK infer failed: {e}')

        # Fall back to HTTP POST to the serverless workflow endpoint
        url = f"{config.ROBOFLOW_API_URL.rstrip('/')}/{config.ROBOFLOW_WORKSPACE}/{config.ROBOFLOW_WORKFLOW_ID}?api_key={config.ROBOFLOW_API_KEY}"
        print(f'[DetectionProcessor] Posting to workflow URL: {url}')
        with open(image_path, 'rb') as fh:
            files = {'file': (os.path.basename(image_path), fh, 'image/png')}
            resp = requests.post(url, files=files, timeout=60)
            resp.raise_for_status()
            return resp.json()

    def _get_mock_detections(self) -> Dict[str, Any]:
        """Return deterministic mock detection predictions."""
        return {
            'predictions': [
                {'class': 'Coca Cola 500ml', 'confidence': 0.94},
                {'class': 'Coca Cola 500ml', 'confidence': 0.91},
                {'class': 'Lays Classic Chips', 'confidence': 0.88},
                {'class': 'Milk 1L', 'confidence': 0.95},
            ]
        }

    def process_detection_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize raw result into category counts and averages."""
        processed = {
            'categories': {},
            'total_items': 0,
            'timestamp': datetime.utcnow().isoformat(),
            'raw_result': result,
        }

        predictions = self._extract_predictions(result)

        category_data: Dict[str, Dict[str, Any]] = {}
        for pred in predictions:
            class_name = pred.get('class', pred.get('class_name', 'unknown'))
            if class_name not in category_data:
                category_data[class_name] = {'count': 0, 'confidences': [], 'bounding_boxes': []}

            category_data[class_name]['count'] += 1
            category_data[class_name]['confidences'].append(pred.get('confidence', 0))

            if all(k in pred for k in ('x', 'y', 'width', 'height')):
                bbox = {'x': pred.get('x', 0), 'y': pred.get('y', 0), 'width': pred.get('width', 0), 'height': pred.get('height', 0)}
                category_data[class_name]['bounding_boxes'].append(bbox)

        for category, data in category_data.items():
            processed['categories'][category] = {
                'count': data['count'],
                'avg_confidence': (sum(data['confidences']) / len(data['confidences'])) if data['confidences'] else 0,
                'bounding_boxes': data['bounding_boxes'],
            }
            processed['total_items'] += data['count']

        return processed

    def _extract_predictions(self, result: Dict[str, Any]) -> List[Dict]:
        """Extract a list of prediction dicts from common result shapes."""
        if result is None:
            return []

        # If result is a dictionary with 'predictions'
        if isinstance(result, dict):
            if 'predictions' in result and isinstance(result['predictions'], list):
                return result['predictions']
            if 'output' in result and isinstance(result['output'], dict):
                out = result['output']
                if 'predictions' in out:
                    return out['predictions']
                if 'object_detection_predictions' in out:
                    return out['object_detection_predictions']

        # If result is a list, assume it's a list of predictions
        if isinstance(result, list):
            return result

        return []

    def categorize_detections(self, detections: Dict[str, Any]) -> List[Dict]:
        """Convert processed detections into DB-ready list of categories."""
        db_ready: List[Dict[str, Any]] = []
        for category_name, data in detections.get('categories', {}).items():
            db_ready.append({
                'category_name': category_name,
                'count': data['count'],
                'confidence': data['avg_confidence'],
                'bounding_boxes': data['bounding_boxes'],
                'timestamp': detections['timestamp'],
            })
        return db_ready
