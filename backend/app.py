from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from sqlalchemy.orm import Session
import config
from database import engine, SessionLocal, init_db
from models import ProductCategory, Detection, InventorySnapshot, Alert
from detector import DetectionProcessor
import json

app = Flask(__name__)
CORS(app, origins=config.CORS_ORIGINS)

# Initialize database
init_db()

# Initialize detector
detector = DetectionProcessor()

# Helper function to get DB session
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        pass

# ============= DETECTION ENDPOINTS =============

@app.route('/api/detect', methods=['POST'])
def detect_and_store():
    """
    Upload an image, run detection, and store results
    
    Body: multipart/form-data with 'image' file
    or JSON: {'image_path': '/path/to/image.jpg'}
    """
    db = SessionLocal()
    try:
        # Get image path
        if request.files and 'image' in request.files:
            # Handle file upload
            file = request.files['image']
            # Save file temporarily
            import os
            upload_dir = '../data/uploads'
            os.makedirs(upload_dir, exist_ok=True)
            image_path = os.path.join(upload_dir, file.filename)
            file.save(image_path)
        elif request.json and 'image_path' in request.json:
            image_path = request.json['image_path']
        else:
            return jsonify({'error': 'No image provided'}), 400
        
        # Run detection
        raw_result = detector.detect_from_image(image_path)
        processed = detector.process_detection_result(raw_result)
        
        # Store in database
        stored_detections = []
        for category_name, data in processed['categories'].items():
            # Get or create category
            category = db.query(ProductCategory).filter_by(name=category_name).first()
            if not category:
                category = ProductCategory(
                    name=category_name,
                    low_stock_threshold=config.LOW_STOCK_THRESHOLD
                )
                db.add(category)
                db.commit()
                db.refresh(category)
            
            # Create detection record
            detection = Detection(
                category_id=category.id,
                count=data['count'],
                confidence=data['avg_confidence'],
                bounding_boxes=data['bounding_boxes'],
                image_path=image_path,
                raw_data=raw_result
            )
            db.add(detection)
            stored_detections.append({
                'category': category_name,
                'count': data['count'],
                'confidence': data['avg_confidence']
            })
            
            # Check for alerts
            check_and_create_alerts(db, category, data['count'])
        
        db.commit()
        
        return jsonify({
            'success': True,
            'detections': stored_detections,
            'total_items': processed['total_items'],
            'timestamp': processed['timestamp']
        })
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

# ============= INVENTORY ENDPOINTS =============

@app.route('/api/inventory/current', methods=['GET'])
def get_current_inventory():
    """Get current inventory counts for all categories"""
    db = SessionLocal()
    try:
        # Get latest detection for each category
        subquery = db.query(
            Detection.category_id,
            func.max(Detection.timestamp).label('max_timestamp')
        ).group_by(Detection.category_id).subquery()
        
        latest_detections = db.query(Detection).join(
            subquery,
            (Detection.category_id == subquery.c.category_id) &
            (Detection.timestamp == subquery.c.max_timestamp)
        ).all()
        
        inventory = []
        for detection in latest_detections:
            category = detection.category
            inventory.append({
                'id': category.id,
                'category': category.name,
                'count': detection.count,
                'confidence': detection.confidence,
                'timestamp': detection.timestamp.isoformat(),
                'low_stock_threshold': category.low_stock_threshold,
                'status': get_stock_status(detection.count, category.low_stock_threshold)
            })
        
        return jsonify({
            'inventory': inventory,
            'total_categories': len(inventory)
        })
        
    finally:
        db.close()

@app.route('/api/inventory/history', methods=['GET'])
def get_inventory_history():
    """
    Get inventory history for analysis
    Query params: category_id (optional), hours (default 24)
    """
    db = SessionLocal()
    try:
        category_id = request.args.get('category_id', type=int)
        hours = request.args.get('hours', default=24, type=int)
        
        # Calculate time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        # Query detections
        query = db.query(Detection).filter(Detection.timestamp >= start_time)
        if category_id:
            query = query.filter(Detection.category_id == category_id)
        
        detections = query.order_by(Detection.timestamp).all()
        
        history = []
        for detection in detections:
            history.append({
                'category': detection.category.name,
                'count': detection.count,
                'timestamp': detection.timestamp.isoformat()
            })
        
        return jsonify({'history': history})
        
    finally:
        db.close()

@app.route('/api/inventory/trends', methods=['GET'])
def get_depletion_trends():
    """
    Calculate depletion rates for each category
    Returns items per hour depletion rate
    """
    db = SessionLocal()
    try:
        hours = request.args.get('hours', default=24, type=int)
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(hours=hours)
        
        categories = db.query(ProductCategory).all()
        trends = []
        
        for category in categories:
            # Get first and last detection in time range
            first = db.query(Detection).filter(
                Detection.category_id == category.id,
                Detection.timestamp >= start_time
            ).order_by(Detection.timestamp).first()
            
            last = db.query(Detection).filter(
                Detection.category_id == category.id,
                Detection.timestamp >= start_time
            ).order_by(desc(Detection.timestamp)).first()
            
            if first and last and first.id != last.id:
                time_diff = (last.timestamp - first.timestamp).total_seconds() / 3600
                count_diff = first.count - last.count
                depletion_rate = count_diff / time_diff if time_diff > 0 else 0
                
                trends.append({
                    'category': category.name,
                    'depletion_rate': round(depletion_rate, 2),
                    'current_count': last.count,
                    'hours_until_empty': round(last.count / depletion_rate, 1) if depletion_rate > 0 else None
                })
        
        return jsonify({'trends': trends})
        
    finally:
        db.close()

# ============= ALERT ENDPOINTS =============

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all active alerts"""
    db = SessionLocal()
    try:
        active_only = request.args.get('active_only', default='true').lower() == 'true'
        
        query = db.query(Alert)
        if active_only:
            query = query.filter(Alert.is_active == 1)
        
        alerts = query.order_by(desc(Alert.created_at)).all()
        
        alert_list = []
        for alert in alerts:
            category = db.query(ProductCategory).get(alert.category_id)
            alert_list.append({
                'id': alert.id,
                'category': category.name if category else 'Unknown',
                'type': alert.alert_type,
                'message': alert.message,
                'count': alert.count,
                'is_active': alert.is_active == 1,
                'created_at': alert.created_at.isoformat(),
                'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None
            })
        
        return jsonify({'alerts': alert_list})
        
    finally:
        db.close()

@app.route('/api/alerts/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    """Mark an alert as resolved"""
    db = SessionLocal()
    try:
        alert = db.query(Alert).get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        alert.is_active = 0
        alert.resolved_at = datetime.utcnow()
        db.commit()
        
        return jsonify({'success': True, 'message': 'Alert resolved'})
        
    finally:
        db.close()

# ============= CATEGORY ENDPOINTS =============

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all product categories"""
    db = SessionLocal()
    try:
        categories = db.query(ProductCategory).all()
        category_list = [{
            'id': cat.id,
            'name': cat.name,
            'description': cat.description,
            'low_stock_threshold': cat.low_stock_threshold
        } for cat in categories]
        
        return jsonify({'categories': category_list})
        
    finally:
        db.close()

@app.route('/api/categories', methods=['POST'])
def create_category():
    """Create a new product category"""
    db = SessionLocal()
    try:
        data = request.json
        category = ProductCategory(
            name=data['name'],
            description=data.get('description'),
            low_stock_threshold=data.get('low_stock_threshold', config.LOW_STOCK_THRESHOLD)
        )
        db.add(category)
        db.commit()
        
        return jsonify({'success': True, 'category_id': category.id})
        
    finally:
        db.close()

# ============= HELPER FUNCTIONS =============

def get_stock_status(count, threshold):
    """Determine stock status"""
    if count == 0:
        return 'out_of_stock'
    elif count <= config.CRITICAL_STOCK_THRESHOLD:
        return 'critical'
    elif count <= threshold:
        return 'low'
    else:
        return 'normal'

def check_and_create_alerts(db: Session, category: ProductCategory, count: int):
    """Check inventory and create alerts if needed"""
    # Check if there's already an active alert
    existing_alert = db.query(Alert).filter(
        Alert.category_id == category.id,
        Alert.is_active == 1
    ).first()
    
    # Determine alert type
    if count == 0:
        alert_type = 'out_of_stock'
        message = f"{category.name} is out of stock"
    elif count <= config.CRITICAL_STOCK_THRESHOLD:
        alert_type = 'critical_stock'
        message = f"{category.name} is critically low ({count} remaining)"
    elif count <= category.low_stock_threshold:
        alert_type = 'low_stock'
        message = f"{category.name} is running low ({count} remaining)"
    else:
        # Resolve existing alert if stock is back to normal
        if existing_alert:
            existing_alert.is_active = 0
            existing_alert.resolved_at = datetime.utcnow()
        return
    
    # Create new alert if none exists or type changed
    if not existing_alert or existing_alert.alert_type != alert_type:
        if existing_alert:
            existing_alert.is_active = 0
            existing_alert.resolved_at = datetime.utcnow()
        
        new_alert = Alert(
            category_id=category.id,
            alert_type=alert_type,
            message=message,
            count=count
        )
        db.add(new_alert)

# ============= HEALTH CHECK =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)