// ============================================
// FRONTEND INTEGRATION EXAMPLES
// ============================================
// Place this in your frontend folder as: frontend/src/services/api.js
// Adjust the API_BASE_URL to match your backend server

const API_BASE_URL = 'http://localhost:5000/api';

// ============= DETECTION API =============

/**
 * Upload an image and run object detection
 * @param {File} imageFile - Image file from input
 * @returns {Promise} Detection results
 */
export async function detectObjects(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Detection failed');
  }
  
  return await response.json();
  // Returns: { success, detections, total_items, timestamp }
}

/**
 * Run detection on an existing image path
 * @param {string} imagePath - Path to image
 */
export async function detectFromPath(imagePath) {
  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_path: imagePath }),
  });
  
  return await response.json();
}

// ============= INVENTORY API =============

/**
 * Get current inventory for all categories
 * @returns {Promise} Current inventory data
 */
export async function getCurrentInventory() {
  const response = await fetch(`${API_BASE_URL}/inventory/current`);
  const data = await response.json();
  return data.inventory;
  // Returns array: [{ id, category, count, confidence, timestamp, status }]
}

/**
 * Get inventory history for charting
 * @param {number} categoryId - Optional category filter
 * @param {number} hours - Hours of history (default 24)
 */
export async function getInventoryHistory(categoryId = null, hours = 24) {
  let url = `${API_BASE_URL}/inventory/history?hours=${hours}`;
  if (categoryId) {
    url += `&category_id=${categoryId}`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  return data.history;
  // Returns: [{ category, count, timestamp }]
}

/**
 * Get depletion trends for all categories
 * @param {number} hours - Analysis period
 */
export async function getDepletionTrends(hours = 24) {
  const response = await fetch(`${API_BASE_URL}/inventory/trends?hours=${hours}`);
  const data = await response.json();
  return data.trends;
  // Returns: [{ category, depletion_rate, current_count, hours_until_empty }]
}

// ============= ALERTS API =============

/**
 * Get all alerts
 * @param {boolean} activeOnly - Only return active alerts
 */
export async function getAlerts(activeOnly = true) {
  const url = `${API_BASE_URL}/alerts?active_only=${activeOnly}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.alerts;
  // Returns: [{ id, category, type, message, count, is_active, created_at }]
}

/**
 * Resolve an alert
 * @param {number} alertId - Alert ID to resolve
 */
export async function resolveAlert(alertId) {
  const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
    method: 'POST',
  });
  return await response.json();
}

// ============= CATEGORIES API =============

/**
 * Get all product categories
 */
export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);
  const data = await response.json();
  return data.categories;
}

/**
 * Create a new product category
 * @param {object} categoryData - { name, description?, low_stock_threshold? }
 */
export async function createCategory(categoryData) {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });
  return await response.json();
}

// ============================================
// REACT COMPONENT EXAMPLES
// ============================================

// Example 1: Image Upload Component
// Place in: frontend/src/components/ImageUpload.jsx

/*
import React, { useState } from 'react';
import { detectObjects } from '../services/api';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const data = await detectObjects(selectedFile);
      setResults(data);
      alert(`Detected ${data.total_items} items!`);
    } catch (error) {
      console.error('Detection error:', error);
      alert('Detection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-upload">
      <h2>Upload Shelf Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? 'Detecting...' : 'Run Detection'}
      </button>
      
      {results && (
        <div className="results">
          <h3>Detection Results</h3>
          <p>Total Items: {results.total_items}</p>
          <ul>
            {results.detections.map((det, i) => (
              <li key={i}>
                {det.category}: {det.count} items 
                (confidence: {(det.confidence * 100).toFixed(1)}%)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
*/

// Example 2: Inventory Dashboard
// Place in: frontend/src/components/InventoryDashboard.jsx

/*
import React, { useState, useEffect } from 'react';
import { getCurrentInventory } from '../services/api';

function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
    // Refresh every 30 seconds
    const interval = setInterval(loadInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getCurrentInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'red';
      case 'low': return 'orange';
      case 'normal': return 'green';
      default: return 'gray';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="inventory-dashboard">
      <h2>Current Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Count</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.category}</td>
              <td>{item.count}</td>
              <td>
                <span style={{ color: getStatusColor(item.status) }}>
                  {item.status.toUpperCase()}
                </span>
              </td>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryDashboard;
*/

// Example 3: Alerts Panel
// Place in: frontend/src/components/AlertsPanel.jsx

/*
import React, { useState, useEffect } from 'react';
import { getAlerts, resolveAlert } from '../services/api';

function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    const data = await getAlerts(true);
    setAlerts(data);
  };

  const handleResolve = async (alertId) => {
    await resolveAlert(alertId);
    loadAlerts(); // Reload alerts
  };

  return (
    <div className="alerts-panel">
      <h2>Stock Alerts ({alerts.length})</h2>
      {alerts.length === 0 ? (
        <p>No active alerts</p>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <div key={alert.id} className={`alert alert-${alert.type}`}>
              <div className="alert-content">
                <strong>{alert.category}</strong>
                <p>{alert.message}</p>
                <small>{new Date(alert.created_at).toLocaleString()}</small>
              </div>
              <button onClick={() => handleResolve(alert.id)}>
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertsPanel;
*/

// Example 4: Depletion Trends Chart (with Chart.js)
// Place in: frontend/src/components/TrendsChart.jsx

/*
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { getInventoryHistory } from '../services/api';

function TrendsChart({ categoryId }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadChartData();
  }, [categoryId]);

  const loadChartData = async () => {
    const history = await getInventoryHistory(categoryId, 24);
    
    // Group by category
    const categories = {};
    history.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = { labels: [], data: [] };
      }
      categories[item.category].labels.push(
        new Date(item.timestamp).toLocaleTimeString()
      );
      categories[item.category].data.push(item.count);
    });

    // Create chart data
    const datasets = Object.keys(categories).map((category, i) => ({
      label: category,
      data: categories[category].data,
      borderColor: `hsl(${i * 60}, 70%, 50%)`,
      fill: false,
    }));

    setChartData({
      labels: categories[Object.keys(categories)[0]]?.labels || [],
      datasets,
    });
  };

  if (!chartData) return <div>Loading chart...</div>;

  return (
    <div className="trends-chart">
      <h2>Stock Levels Over Time</h2>
      <Line data={chartData} />
    </div>
  );
}

export default TrendsChart;
*/

// ============================================
// VANILLA JAVASCRIPT EXAMPLES (No React)
// ============================================

// Example: Simple dashboard with vanilla JS
// Place in: frontend/index.html and script.js

/*
<!-- frontend/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Inventory Dashboard</title>
  <style>
    .alert { padding: 10px; margin: 5px; border-radius: 5px; }
    .alert-critical { background: #ffcccc; }
    .alert-low_stock { background: #ffe6cc; }
  </style>
</head>
<body>
  <h1>Supermarket Inventory Dashboard</h1>
  
  <!-- Upload Section -->
  <div>
    <h2>Upload Image</h2>
    <input type="file" id="imageInput" accept="image/*">
    <button onclick="uploadImage()">Detect Objects</button>
  </div>

  <!-- Inventory Table -->
  <div>
    <h2>Current Inventory</h2>
    <table id="inventoryTable" border="1">
      <thead>
        <tr><th>Product</th><th>Count</th><th>Status</th></tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>

  <!-- Alerts -->
  <div>
    <h2>Alerts</h2>
    <div id="alertsContainer"></div>
  </div>

  <script src="script.js"></script>
</body>
</html>

<!-- frontend/script.js -->
const API_BASE = 'http://localhost:5000/api';

async function uploadImage() {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];
  if (!file) return alert('Select an image first');

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  alert(`Detected ${result.total_items} items!`);
  loadInventory(); // Refresh inventory
}

async function loadInventory() {
  const response = await fetch(`${API_BASE}/inventory/current`);
  const data = await response.json();
  
  const tbody = document.querySelector('#inventoryTable tbody');
  tbody.innerHTML = '';
  
  data.inventory.forEach(item => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${item.category}</td>
      <td>${item.count}</td>
      <td style="color: ${getStatusColor(item.status)}">${item.status}</td>
    `;
  });
}

async function loadAlerts() {
  const response = await fetch(`${API_BASE}/alerts`);
  const data = await response.json();
  
  const container = document.getElementById('alertsContainer');
  container.innerHTML = '';
  
  data.alerts.forEach(alert => {
    const div = document.createElement('div');
    div.className = `alert alert-${alert.type}`;
    div.innerHTML = `
      <strong>${alert.category}</strong>: ${alert.message}
      <button onclick="resolveAlert(${alert.id})">Resolve</button>
    `;
    container.appendChild(div);
  });
}

async function resolveAlert(alertId) {
  await fetch(`${API_BASE}/alerts/${alertId}/resolve`, { method: 'POST' });
  loadAlerts();
}

function getStatusColor(status) {
  return { critical: 'red', low: 'orange', normal: 'green' }[status] || 'gray';
}

// Load data on page load
loadInventory();
loadAlerts();
setInterval(loadInventory, 30000); // Refresh every 30s
setInterval(loadAlerts, 10000);    // Refresh every 10s
*/