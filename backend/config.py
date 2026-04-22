import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR}/data/inventory.db')

# Roboflow API
ROBOFLOW_API_KEY = "DTS16twTzIANynxoqpU8"
ROBOFLOW_WORKSPACE = "ssim"
# Note: The current model "ssim/projects" has no training data.
# To use real inference, you must:
# 1. Train the model with annotated images in the Roboflow dashboard
# 2. Deploy it to Roboflow's serverless inference
# 3. Update ROBOFLOW_PROJECT and ROBOFLOW_VERSION below
ROBOFLOW_PROJECT = "projects"  # Placeholder - no trained model yet
ROBOFLOW_VERSION = "2"  # Placeholder version
ROBOFLOW_MODEL_ID = f"{ROBOFLOW_WORKSPACE}/{ROBOFLOW_PROJECT}/{ROBOFLOW_VERSION}"
ROBOFLOW_WORKFLOW_ID = "detect-count-and-visualize"  # Placeholder
ROBOFLOW_API_URL = "https://serverless.roboflow.com"
USE_MOCK_DETECTION = True  # Set to False once a trained model is deployed
# Roboflow API
ROBOFLOW_API_KEY = "DTS16twTzIANynxoqpU8"
ROBOFLOW_WORKSPACE = "ssim"

# Workflow configuration
ROBOFLOW_WORKFLOW_ID = "detect-count-and-visualize"  # Correct workflow ID
ROBOFLOW_API_URL = "https://serverless.roboflow.com"

# IMPORTANT: The workflow currently returns 502 errors (server-side issue).
# To enable real detection:
# 1. Contact Roboflow support or fix the workflow at:
#    https://app.roboflow.com/ssim/workflows/detect-count-and-visualize
# 2. Once fixed, set USE_MOCK_DETECTION = False below
USE_MOCK_DETECTION = True  # Set to False once workflow is fixed

# Stock thresholds
LOW_STOCK_THRESHOLD = 5  # Alert when items fall below this count
CRITICAL_STOCK_THRESHOLD = 2

# Server
HOST = '0.0.0.0'
PORT = 5000
DEBUG = True

# CORS (allow your frontend URL)
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]