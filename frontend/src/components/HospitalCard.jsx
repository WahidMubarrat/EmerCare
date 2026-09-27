import React from 'react';
import { formatDistance } from '../utils/locationUtils';

export default function HospitalCard({ hospital, distance, onViewServices }) {
  return (
    <div className="hospital-card">
      <div className="hospital-info">
        <div className="hospital-main-info">
          <div className="hospital-header">
            <h2 className="hospital-name">{hospital.hospitalName}</h2>
            {distance !== undefined && distance !== null && (
              <span className="distance-badge">📍 {formatDistance(distance)}</span>
            )}
          </div>
          <div className="hospital-meta">
            <span className="location">📍 {hospital.city}, {hospital.postcode}</span>
          </div>
          <div className="hospital-contact">
            <span>📞 {hospital.phone}</span>
            <span>✉️ {hospital.email}</span>
          </div>
          <div className="hospital-address">
            {hospital.street}, {hospital.city}, {hospital.postcode}
          </div>
        </div>
      </div>

      <div className="hospital-actions">
        <button 
          className="action-btn btn-services"
          onClick={() => onViewServices(hospital._id)}
        >
          Services
        </button>
      </div>
    </div>
  );
}
