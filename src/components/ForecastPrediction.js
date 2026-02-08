import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './ForecastPrediction.css';

const ForecastPrediction = () => {
  const [forecastData, setForecastData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchForecastData();
    const interval = setInterval(fetchForecastData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchForecastData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/forecast');
      setForecastData(response.data.forecasts || []);
      setChartData(response.data.historical || []);
      setError(null);
    } catch (err) {
      setError('Unable to fetch forecast data. Backend may be unavailable.');
      setForecastData([
        { sku: 'CC-500-001', productName: 'Coca Cola 500ml', timeUntilEmpty: '2.5 hours', suggestedRestock: '1.5 hours' },
        { sku: 'LC-150-002', productName: 'Lays Classic Chips', timeUntilEmpty: '1.2 hours', suggestedRestock: '0.5 hours' },
        { sku: 'BW-500-004', productName: 'Bread White', timeUntilEmpty: '0.8 hours', suggestedRestock: 'Immediate' },
      ]);
      
      const mockChartData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        mockChartData.push({
          time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          stock: Math.max(0, 20 - i * 2.5),
          predicted: Math.max(0, 20 - i * 2.5 - (6 - i) * 0.3)
        });
      }
      setChartData(mockChartData);
    } finally {
      setLoading(false);
    }
  };

  if (loading && forecastData.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">Restock Forecast</h2>
        <div className="loading">Loading forecast data...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">Restock Forecast</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="forecast-table-container">
        <table className="forecast-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>⏱️ Predicted Time Until Empty</th>
              <th>⚠️ Suggested Restock Time</th>
            </tr>
          </thead>
          <tbody>
            {forecastData.length === 0 ? (
              <tr>
                <td colSpan="3" className="no-data">No forecast data available</td>
              </tr>
            ) : (
              forecastData.map((item, index) => (
                <tr key={index}>
                  <td className="sku-cell">{item.sku}</td>
                  <td>{item.timeUntilEmpty}</td>
                  <td className={item.suggestedRestock === 'Immediate' ? 'urgent' : ''}>
                    {item.suggestedRestock}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">Historical Stock vs Predicted Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="stock" 
              stroke="#1976d2" 
              strokeWidth={2}
              name="Historical Stock"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#f44336" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Trend"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastPrediction;
