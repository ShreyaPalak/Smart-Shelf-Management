// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './DetectedItemsSummary.css';

// const DetectedItemsSummary = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchDetectedItems();
//     const interval = setInterval(fetchDetectedItems, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const fetchDetectedItems = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('/api/detect');
//       setItems(response.data.items || []);
//       setError(null);
//     } catch (err) {
//       setError('Unable to fetch detected items. Backend may be unavailable.');
//       setItems([
//         { productName: 'Coca Cola 500ml', sku: 'CC-500-001', quantity: 12, confidence: 94.5 },
//         { productName: 'Lays Classic Chips', sku: 'LC-150-002', quantity: 8, confidence: 91.2 },
//         { productName: 'Milk 1L', sku: 'MK-1000-003', quantity: 15, confidence: 96.8 },
//         { productName: 'Bread White', sku: 'BW-500-004', quantity: 5, confidence: 88.3 },
//         { productName: 'Eggs 12pk', sku: 'EG-12-005', quantity: 20, confidence: 92.1 },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && items.length === 0) {
//     return (
//       <div className="card">
//         <h2 className="card-title">Detected Products</h2>
//         <div className="loading">Loading detected items...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="card">
//       <h2 className="card-title">Detected Products</h2>
//       {error && <div className="error-message">{error}</div>}
//       <div className="table-container">
//         <table className="detected-items-table">
//           <thead>
//             <tr>
//               <th>Product Name</th>
//               <th>SKU</th>
//               <th>Current Quantity</th>
//               <th>Confidence (%)</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 ? (
//               <tr>
//                 <td colSpan="4" className="no-data">No items detected</td>
//               </tr>
//             ) : (
//               items.map((item, index) => (
//                 <tr key={index}>
//                   <td>{item.productName}</td>
//                   <td className="sku-cell">{item.sku}</td>
//                   <td>{item.quantity}</td>
//                   <td>
//                     <span className={`confidence-badge ${item.confidence >= 90 ? 'high' : item.confidence >= 75 ? 'medium' : 'low'}`}>
//                       {item.confidence.toFixed(1)}%
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DetectedItemsSummary;

// REPLACE your DetectedItemsSummary.js with this code
// Location: frontend/src/components/DetectedItemsSummary.js

import React, { useState, useEffect } from 'react';
import { getCurrentInventory } from "../services/api";

import './DetectedItemsSummary.css';

function DetectedItemsSummary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data when component mounts
  useEffect(() => {
    loadDetectedItems();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDetectedItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDetectedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend API
      const inventory = await getCurrentInventory();
      
      // Convert backend format to your component format
      const formattedItems = inventory.map(item => ({
        name: item.category,
        sku: `SKU-${item.id}`,
        quantity: item.count,
        confidence: (item.confidence * 100).toFixed(1) // Convert 0.95 to 95.0
      }));
      
      setItems(formattedItems);
      setLoading(false);
    } catch (err) {
      console.error('Error loading detected items:', err);
      setError('Unable to fetch detected items. Backend may be unavailable.');
      setLoading(false);
      
      // Fallback to mock data if backend fails
      setItems([
        { name: 'Coca Cola 500ml', sku: 'CC-500-001', quantity: 12, confidence: '94.5' },
        { name: 'Lays Classic Chips', sku: 'LC-150-002', quantity: 8, confidence: '91.2' }
      ]);
    }
  };

  return (
    <div className="detected-items-summary">
      <h2>Detected Products</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Current Quantity</th>
              <th>Confidence (%)</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="4">No items detected yet. Upload an image to start!</td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>{item.confidence}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      
      <button onClick={loadDetectedItems} className="refresh-btn">
        Refresh Data
      </button>
    </div>
  );
}

export default DetectedItemsSummary;