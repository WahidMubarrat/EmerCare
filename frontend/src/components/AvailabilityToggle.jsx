import React from 'react';
import '../styles/AvailabilityToggle.css';

export default function AvailabilityToggle({ isAvailable, onToggle, disabled = false }) {
  return (
    <div className="availability-toggle-container">
      <label className="availability-label">Donation Availability</label>
      <div className={`toggle-wrapper ${disabled ? 'disabled' : ''}`}>
        <button
          className={`toggle-option ${!isAvailable ? 'active' : ''}`}
          onClick={() => !disabled && onToggle(false)}
          disabled={disabled}
        >
          Unavailable
        </button>
        <button
          className={`toggle-option ${isAvailable ? 'active' : ''}`}
          onClick={() => !disabled && onToggle(true)}
          disabled={disabled}
        >
          Available
        </button>
        <div className={`toggle-slider ${isAvailable ? 'right' : 'left'}`}></div>
      </div>
      <p className="availability-status">
        {isAvailable ? (
          <span className="status-available">✓ You are available for blood donation</span>
        ) : (
          <span className="status-unavailable">✗ You are currently unavailable</span>
        )}
      </p>
    </div>
  );
}
