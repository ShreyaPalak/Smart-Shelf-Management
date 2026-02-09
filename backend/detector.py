from inference_sdk import InferenceHTTPClient
from datetime import datetime
from typing import Dict, List, Any
import config

class DetectionProcessor:
    """Process YOLO detection results and extract structured data"""
    
    def __init__(self):
        self.client = InferenceHTTPClient(
            api_url=config.ROBOFLOW_API_URL,
            api_key=config.ROBOFLOW_API_KEY
        )
    
    def detect_from_image(self, image_path: str) -> Dict[str, Any]:
        """
        Run detection on an image and return structured results
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary with detection results
        """
        result = self.client.run_workflow(
            workspace_name=config.ROBOFLOW_WORKSPACE,
            workflow_id=config.ROBOFLOW_WORKFLOW_ID,
            images={"image": image_path},
            use_cache=True
        )
        
        return result
    
    def process_detection_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process raw detection result into structured format
        
        Expected result format from YOLO:
        {
            'output': {
                'predictions': [
                    {
                        'class': 'product_name',
                        'confidence': 0.95,
                        'x': 100, 'y': 150,
                        'width': 50, 'height': 60
                    },
                    ...
                ]
            }
        }
        
        Returns:
            {
                'categories': {
                    'product_name': {
                        'count': 5,
                        'avg_confidence': 0.92,
                        'bounding_boxes': [...]
                    }
                },
                'total_items': 15,
                'timestamp': '2024-02-09T10:30:00'
            }
        """
        processed = {
            'categories': {},
            'total_items': 0,
            'timestamp': datetime.utcnow().isoformat(),
            'raw_result': result
        }
        
        # Extract predictions from result
        # Adjust this based on your actual YOLO output structure
        predictions = self._extract_predictions(result)
        
        # Group by category
        category_data = {}
        
        for pred in predictions:
            class_name = pred.get('class', pred.get('class_name', 'unknown'))
            
            if class_name not in category_data:
                category_data[class_name] = {
                    'count': 0,
                    'confidences': [],
                    'bounding_boxes': []
                }
            
            category_data[class_name]['count'] += 1
            category_data[class_name]['confidences'].append(pred.get('confidence', 0))
            
            # Store bounding box
            bbox = {
                'x': pred.get('x', 0),
                'y': pred.get('y', 0),
                'width': pred.get('width', 0),
                'height': pred.get('height', 0)
            }
            category_data[class_name]['bounding_boxes'].append(bbox)
        
        # Calculate averages
        for category, data in category_data.items():
            processed['categories'][category] = {
                'count': data['count'],
                'avg_confidence': sum(data['confidences']) / len(data['confidences']) if data['confidences'] else 0,
                'bounding_boxes': data['bounding_boxes']
            }
            processed['total_items'] += data['count']
        
        return processed
    
    def _extract_predictions(self, result: Dict[str, Any]) -> List[Dict]:
        """
        Extract predictions from various YOLO output formats
        Adapt this to match your specific YOLO output structure
        """
        # Try common output structures
        if isinstance(result, list) and len(result) > 0:
            # Format: [{'output': {...}}]
            if 'output' in result[0]:
                output = result[0]['output']
                if 'predictions' in output:
                    return output['predictions']
                elif 'object_detection_predictions' in output:
                    return output['object_detection_predictions']
        
        # Format: {'output': {'predictions': [...]}}
        if 'output' in result:
            output = result['output']
            if 'predictions' in output:
                return output['predictions']
            elif 'object_detection_predictions' in output:
                return output['object_detection_predictions']
        
        # Format: {'predictions': [...]}
        if 'predictions' in result:
            return result['predictions']
        
        # Format: Direct list of predictions
        if isinstance(result, list):
            return result
        
        return []
    
    def categorize_detections(self, detections: Dict[str, Any]) -> List[Dict]:
        """
        Convert processed detections to database-ready format
        
        Returns:
            List of category dictionaries ready for database insertion
        """
        db_ready = []
        
        for category_name, data in detections.get('categories', {}).items():
            db_ready.append({
                'category_name': category_name,
                'count': data['count'],
                'confidence': data['avg_confidence'],
                'bounding_boxes': data['bounding_boxes'],
                'timestamp': detections['timestamp']
            })
        
        return db_ready