import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import '../App.css';
import './Analytics.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics?range=${timeRange}`);
      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      setError('Unable to fetch analytics data. Backend may be unavailable.');
      // Mock data for demonstration
      setAnalyticsData({
        salesTrend: [
          { time: '00:00', sales: 45 },
          { time: '04:00', sales: 32 },
          { time: '08:00', sales: 78 },
          { time: '12:00', sales: 120 },
          { time: '16:00', sales: 95 },
          { time: '20:00', sales: 67 },
        ],
        productDistribution: [
          { name: 'Beverages', value: 35, count: 120 },
          { name: 'Snacks', value: 25, count: 85 },
          { name: 'Dairy', value: 20, count: 68 },
          { name: 'Bakery', value: 15, count: 52 },
          { name: 'Other', value: 5, count: 18 },
        ],
        topProducts: [
          { product: 'Coca Cola 500ml', sales: 145, revenue: 435 },
          { product: 'Milk 1L', sales: 98, revenue: 294 },
          { product: 'Lays Classic Chips', sales: 87, revenue: 348 },
          { product: 'Bread White', sales: 76, revenue: 152 },
          { product: 'Eggs 12pk', sales: 65, revenue: 195 },
        ],
        detectionAccuracy: 94.2,
        totalDetections: 1247,
        averageConfidence: 91.5,
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'];

  if (loading && !analyticsData) {
    return (
      <main className="dashboard-container">
        <div className="loading">Loading analytics...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <div className="analytics-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <div className="time-range-selector">
          <button 
            className={timeRange === '24h' ? 'active' : ''} 
            onClick={() => setTimeRange('24h')}
          >
            24 Hours
          </button>
          <button 
            className={timeRange === '7d' ? 'active' : ''} 
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={timeRange === '30d' ? 'active' : ''} 
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="analytics-grid">
        {/* Key Metrics Cards */}
        <div className="card metrics-card">
          <h3 className="metrics-title">Detection Accuracy</h3>
          <div className="metric-value">{analyticsData?.detectionAccuracy || 0}%</div>
        </div>
        <div className="card metrics-card">
          <h3 className="metrics-title">Total Detections</h3>
          <div className="metric-value">{analyticsData?.totalDetections?.toLocaleString() || 0}</div>
        </div>
        <div className="card metrics-card">
          <h3 className="metrics-title">Avg Confidence</h3>
          <div className="metric-value">{analyticsData?.averageConfidence || 0}%</div>
        </div>

        {/* Sales Trend Chart */}
        <div className="card chart-card">
          <h2 className="card-title">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.salesTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#1976d2" name="Sales Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Product Distribution Pie Chart */}
        <div className="card chart-card">
          <h2 className="card-title">Product Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData?.productDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {(analyticsData?.productDistribution || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Table */}
        <div className="card table-card">
          <h2 className="card-title">Top Products</h2>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sales</th>
                <th>Revenue ($)</th>
              </tr>
            </thead>
            <tbody>
              {(analyticsData?.topProducts || []).map((product, index) => (
                <tr key={index}>
                  <td>{product.product}</td>
                  <td>{product.sales}</td>
                  <td>${product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Analytics;
