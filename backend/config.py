import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Database
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR}/data/inventory.db')

# Roboflow API
ROBOFLOW_API_KEY = "DTS16twTzIANynxoqpU8"
ROBOFLOW_WORKSPACE = "ssim"
ROBOFLOW_WORKFLOW_ID = "detect-count-and-visualize"
ROBOFLOW_API_URL = "https://serverless.roboflow.com"

# Stock thresholds
LOW_STOCK_THRESHOLD = 5  # Alert when items fall below this count
CRITICAL_STOCK_THRESHOLD = 2

# Server
HOST = '0.0.0.0'
PORT = 5000
DEBUG = True

# CORS (allow your frontend URL)
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]