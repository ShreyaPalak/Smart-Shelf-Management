from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class ProductCategory(Base):
    """Product category master table"""
    __tablename__ = 'product_categories'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    low_stock_threshold = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    detections = relationship("Detection", back_populates="category")
    inventory_snapshots = relationship("InventorySnapshot", back_populates="category")

class Detection(Base):
    """Individual detection records from YOLO"""
    __tablename__ = 'detections'
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('product_categories.id'))
    count = Column(Integer)
    confidence = Column(Float, nullable=True)
    bounding_boxes = Column(JSON, nullable=True)  # Store as JSON array
    image_path = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    raw_data = Column(JSON, nullable=True)  # Store full detection result
    
    # Relationships
    category = relationship("ProductCategory", back_populates="detections")

class InventorySnapshot(Base):
    """Aggregated inventory snapshots (hourly/daily)"""
    __tablename__ = 'inventory_snapshots'
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('product_categories.id'))
    count = Column(Integer)
    snapshot_type = Column(String)  # 'hourly', 'daily'
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    category = relationship("ProductCategory", back_populates="inventory_snapshots")

class Alert(Base):
    """Stock alerts"""
    __tablename__ = 'alerts'
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('product_categories.id'))
    alert_type = Column(String)  # 'low_stock', 'critical_stock', 'out_of_stock'
    message = Column(String)
    count = Column(Integer)
    is_active = Column(Integer, default=1)  # 1 = active, 0 = resolved
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)