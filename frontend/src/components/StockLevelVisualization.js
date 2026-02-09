import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StockLevelVisualization.css';

const StockLevelVisualization = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/detect');
      const items = response.data.items || [];
      const processed = items.map(item => ({
        sku: item.sku,
        productName: item.productName,
        stockPercentage: Math.min(100, (item.quantity / 20) * 100),
        quantity: item.quantity
      }));
      setStockData(processed);
      setError(null);
    } catch (err) {
      setError('Unable to fetch stock data. Backend may be unavailable.');
      setStockData([
        { sku: 'CC-500-001', productName: 'Coca Cola 500ml', stockPercentage: 60, quantity: 12 },
        { sku: 'LC-150-002', productName: 'Lays Classic Chips', stockPercentage: 40, quantity: 8 },
        { sku: 'MK-1000-003', productName: 'Milk 1L', stockPercentage: 75, quantity: 15 },
        { sku: 'BW-500-004', productName: 'Bread White', stockPercentage: 25, quantity: 5 },
        { sku: 'EG-12-005', productName: 'Eggs 12pk', stockPercentage: 100, quantity: 20 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (percentage) => {
    if (percentage >= 60) return '#4caf50';
    if (percentage >= 30) return '#ff9800';
    return '#f44336';
  };

  if (loading && stockData.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Stock Level Overview</h2>
        <div className="loading">Loading stock levels...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Stock Level Overview</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="stock-list">
        {stockData.length === 0 ? (
          <div className="no-data">No stock data available</div>
        ) : (
          stockData.map((item, index) => (
            <div key={index} className="stock-item">
              <div className="stock-header">
                <span className="stock-sku">{item.sku}</span>
                <span className="stock-percentage">{item.stockPercentage.toFixed(0)}%</span>
              </div>
              <div className="stock-bar-container">
                <div
                  className="stock-bar"
                  style={{
                    width: `${item.stockPercentage}%`,
                    backgroundColor: getStockColor(item.stockPercentage)
                  }}
                />
              </div>
              <div className="stock-footer">
                <span className="stock-name">{item.productName}</span>
                <span className="stock-quantity">Qty: {item.quantity}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockLevelVisualization;
