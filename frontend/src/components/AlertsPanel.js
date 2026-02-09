import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AlertsPanel.css';

const AlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/alerts').catch(() => 
        axios.get('/api/detect')
      );
      
      const alertsData = response.data.alerts || [];
      
      if (alertsData.length === 0 && response.data.items) {
        const items = response.data.items;
        const generatedAlerts = [];
        
        items.forEach(item => {
          if (item.quantity < 10) {
            generatedAlerts.push({
              type: 'low_stock',
              message: `Low Stock Alert: ${item.productName} (${item.sku})`,
              timestamp: new Date().toLocaleString(),
              severity: item.quantity < 5 ? 'critical' : 'warning'
            });
          }
          if (item.quantity < 5) {
            generatedAlerts.push({
              type: 'restock_soon',
              message: `Restock Soon: ${item.productName} (${item.sku})`,
              timestamp: new Date().toLocaleString(),
              severity: 'critical'
            });
          }
        });
        
        setAlerts(generatedAlerts);
      } else {
        setAlerts(alertsData);
      }
      
      setError(null);
    } catch (err) {
      setError('Unable to fetch alerts. Backend may be unavailable.');
      setAlerts([
        {
          type: 'low_stock',
          message: 'Low Stock Alert: Bread White (BW-500-004)',
          timestamp: new Date(Date.now() - 300000).toLocaleString(),
          severity: 'critical'
        },
        {
          type: 'restock_soon',
          message: 'Restock Soon: Lays Classic Chips (LC-150-002)',
          timestamp: new Date(Date.now() - 600000).toLocaleString(),
          severity: 'warning'
        },
        {
          type: 'low_stock',
          message: 'Low Stock Alert: Coca Cola 500ml (CC-500-001)',
          timestamp: new Date(Date.now() - 900000).toLocaleString(),
          severity: 'warning'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    if (type === 'low_stock') return '⚠️';
    if (type === 'restock_soon') return '⏰';
    return 'ℹ️';
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Alerts & Notifications</h2>
        <div className="loading">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Alerts & Notifications</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <p>No active alerts</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div
              key={index}
              className={`alert-item ${alert.severity === 'critical' ? 'critical' : ''}`}
            >
              <div className="alert-icon">{getAlertIcon(alert.type)}</div>
              <div className="alert-content">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-timestamp">{alert.timestamp}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
