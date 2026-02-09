import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import './Alerts.css';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
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
              severity: item.quantity < 5 ? 'critical' : 'warning',
              sku: item.sku,
              productName: item.productName,
              quantity: item.quantity
            });
          }
          if (item.quantity < 5) {
            generatedAlerts.push({
              type: 'restock_soon',
              message: `Restock Soon: ${item.productName} (${item.sku})`,
              timestamp: new Date().toLocaleString(),
              severity: 'critical',
              sku: item.sku,
              productName: item.productName,
              quantity: item.quantity
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
          severity: 'critical',
          sku: 'BW-500-004',
          productName: 'Bread White',
          quantity: 5
        },
        {
          type: 'restock_soon',
          message: 'Restock Soon: Lays Classic Chips (LC-150-002)',
          timestamp: new Date(Date.now() - 600000).toLocaleString(),
          severity: 'warning',
          sku: 'LC-150-002',
          productName: 'Lays Classic Chips',
          quantity: 8
        },
        {
          type: 'low_stock',
          message: 'Low Stock Alert: Coca Cola 500ml (CC-500-001)',
          timestamp: new Date(Date.now() - 900000).toLocaleString(),
          severity: 'warning',
          sku: 'CC-500-001',
          productName: 'Coca Cola 500ml',
          quantity: 12
        },
        {
          type: 'system',
          message: 'System Health Check: All sensors operational',
          timestamp: new Date(Date.now() - 1200000).toLocaleString(),
          severity: 'info',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    if (type === 'low_stock') return '⚠️';
    if (type === 'restock_soon') return '⏰';
    if (type === 'system') return 'ℹ️';
    return '🔔';
  };

  const getSeverityLabel = (severity) => {
    if (severity === 'critical') return 'Critical';
    if (severity === 'warning') return 'Warning';
    return 'Info';
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const infoCount = alerts.filter(a => a.severity === 'info').length;

  if (loading && alerts.length === 0) {
    return (
      <main className="dashboard-container">
        <div className="loading">Loading alerts...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <div className="alerts-page-header">
        <h1 className="page-title">Alerts & Notifications</h1>
        <div className="alert-stats">
          <div className="stat-item critical">
            <span className="stat-count">{criticalCount}</span>
            <span className="stat-label">Critical</span>
          </div>
          <div className="stat-item warning">
            <span className="stat-count">{warningCount}</span>
            <span className="stat-label">Warning</span>
          </div>
          <div className="stat-item info">
            <span className="stat-count">{infoCount}</span>
            <span className="stat-label">Info</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-bar">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({alerts.length})
        </button>
        <button 
          className={`filter-button ${filter === 'critical' ? 'active' : ''}`}
          onClick={() => setFilter('critical')}
        >
          Critical ({criticalCount})
        </button>
        <button 
          className={`filter-button ${filter === 'warning' ? 'active' : ''}`}
          onClick={() => setFilter('warning')}
        >
          Warning ({warningCount})
        </button>
        <button 
          className={`filter-button ${filter === 'info' ? 'active' : ''}`}
          onClick={() => setFilter('info')}
        >
          Info ({infoCount})
        </button>
      </div>

      <div className="alerts-page-list">
        {filteredAlerts.length === 0 ? (
          <div className="no-alerts-card">
            <p>No alerts found</p>
          </div>
        ) : (
          filteredAlerts.map((alert, index) => (
            <div
              key={index}
              className={`alert-card ${alert.severity}`}
            >
              <div className="alert-card-header">
                <div className="alert-icon-large">{getAlertIcon(alert.type)}</div>
                <div className="alert-header-content">
                  <div className="alert-message-large">{alert.message}</div>
                  <div className="alert-meta">
                    <span className="severity-badge">{getSeverityLabel(alert.severity)}</span>
                    <span className="alert-timestamp-large">{alert.timestamp}</span>
                  </div>
                </div>
              </div>
              {alert.sku && (
                <div className="alert-details">
                  <div className="detail-item">
                    <span className="detail-label">SKU:</span>
                    <span className="detail-value">{alert.sku}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Product:</span>
                    <span className="detail-value">{alert.productName}</span>
                  </div>
                  {alert.quantity !== undefined && (
                    <div className="detail-item">
                      <span className="detail-label">Current Quantity:</span>
                      <span className="detail-value">{alert.quantity}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Alerts;
