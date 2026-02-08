import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import TopNavigation from './components/TopNavigation';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';

function App() {
  return (
    <Router>
      <div className="App">
        <TopNavigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
        <footer className="app-footer">
          <p>Smart Shelf Management System – AI-based Inventory Monitoring</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;