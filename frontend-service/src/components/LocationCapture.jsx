import React, { useState } from 'react';
import { getUserLocation } from '../utils/locationUtils';
import '../styles/LocationCapture.css';

export default function LocationCapture({ onLocationCapture, hasLocation, error }) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCaptureLocation = async () => {
    setIsCapturing(true);
    try {
      const position = await getUserLocation();
      onLocationCapture({
        latitude: position.latitude,
        longitude: position.longitude
      });
    } catch (err) {
      onLocationCapture(null, err.message || 'Failed to get location');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="location-capture">
      <label>GPS Location (Optional)</label>
      <p className="location-info">
        Share your location to help people find you nearby during emergencies
      </p>
      
      <button
        type="button"
        className={`capture-btn ${hasLocation ? 'captured' : ''}`}
        onClick={handleCaptureLocation}
        disabled={isCapturing}
      >
        {isCapturing ? (
          <>
            <span className="spinner"></span>
            Getting Location...
          </>
        ) : hasLocation ? (
          <>
            ✓ Location Captured
          </>
        ) : (
          <>
            📍 Capture My Location
          </>
        )}
      </button>

      {hasLocation && (
        <div className="location-success">
          <span className="success-icon">✓</span>
          <span>GPS coordinates saved successfully</span>
        </div>
      )}

      {error && (
        <span className="error-message">{error}</span>
      )}

      <small className="field-hint">
        Location helps users find the nearest services during emergencies. You can skip this if you prefer.
      </small>
    </div>
  );
}
