import React from 'react';
import { formatDistance } from '../utils/locationUtils';

export default function DonorCard({ donor, distance }) {
  return (
    <div className={`donor-card ${!donor.isActive ? 'unavailable' : ''}`}>
      <div className="donor-info">
        <div className="donor-main-info">
          <div className="donor-header">
            <h2 className="donor-name">{donor.name}</h2>
            <span className="blood-group-badge">{donor.bloodGroup}</span>
            {distance !== undefined && distance !== null && (
              <span className="distance-badge">📍 {formatDistance(distance)}</span>
            )}
            {!donor.isActive && (
              <span className="availability-badge unavailable">Unavailable</span>
            )}
            {donor.isActive && (
              <span className="availability-badge available">Available</span>
            )}
          </div>
          <div className="donor-meta">
            <span className="location">📍 {donor.city}, {donor.postcode}</span>
            <span className="age">👤 Age: {donor.age}</span>
          </div>
          <div className="donor-contact">
            <span>📞 {donor.phone}</span>
            <span>✉️ {donor.email}</span>
          </div>
          <div className="donor-address">
            {donor.street}, {donor.city}, {donor.postcode}
          </div>
        </div>
      </div>

      <div className="donor-actions">
        <button 
          className="action-btn btn-email"
          onClick={() => window.location.href = `mailto:${donor.email}`}
          disabled={!donor.isActive}
        >
          Send Email
        </button>
      </div>
    </div>
  );
}
