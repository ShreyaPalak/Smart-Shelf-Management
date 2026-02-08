import React from 'react';
import LiveShelfMonitoring from '../components/LiveShelfMonitoring';
import DetectedItemsSummary from '../components/DetectedItemsSummary';
import StockLevelVisualization from '../components/StockLevelVisualization';
import ForecastPrediction from '../components/ForecastPrediction';
import AlertsPanel from '../components/AlertsPanel';
import '../App.css';

const Home = () => {
  return (
    <main className="dashboard-container">
      <div className="dashboard-grid">
        <LiveShelfMonitoring />
        <DetectedItemsSummary />
        <StockLevelVisualization />
        <ForecastPrediction />
        <AlertsPanel />
      </div>
    </main>
  );
};

export default Home;
