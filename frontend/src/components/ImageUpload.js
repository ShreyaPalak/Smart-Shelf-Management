// ADD THIS NEW COMPONENT to upload images and run detection
// Location: frontend/src/components/ImageUpload.js

import React, { useState } from 'react';
import { detectObjects } from "../services/api";
import './ImageUpload.css';

function ImageUpload({ onDetectionComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image first!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Call backend detection API
      const data = await detectObjects(selectedFile);
      
      setResult(data);
      alert(`✅ Detection complete! Found ${data.total_items} items`);
      
      // Notify parent component to refresh data
      if (onDetectionComplete) {
        onDetectionComplete(data);
      }
    } catch (error) {
      console.error('Detection error:', error);
      alert('❌ Detection failed. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="image-upload">
      <h2>📸 Upload Shelf Image</h2>
      
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
        />
        
        <button 
          onClick={handleUpload} 
          disabled={!selectedFile || loading}
          className="upload-btn"
        >
          {loading ? '🔄 Detecting...' : '🚀 Run Detection'}
        </button>
        
        {selectedFile && (
          <button onClick={handleClear} className="clear-btn">
            Clear
          </button>
        )}
      </div>

      {preview && (
        <div className="preview-section">
          <h3>Preview:</h3>
          <img src={preview} alt="Preview" style={{ maxWidth: '400px' }} />
        </div>
      )}

      {result && (
        <div className="result-section">
          <h3>✅ Detection Results:</h3>
          <p><strong>Total Items:</strong> {result.total_items}</p>
          <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
          
          <h4>Detected Products:</h4>
          <ul>
            {result.detections.map((det, i) => (
              <li key={i}>
                <strong>{det.category}</strong>: {det.count} items 
                ({(det.confidence * 100).toFixed(1)}% confidence)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;