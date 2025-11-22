import React from 'react';
import AmbulanceVehicleInfoCard from './AmbulanceVehicleInfoCard';
import { formatDistance } from '../utils/locationUtils';

export default function AmbulanceOwnerInfoCard({ ambulance, distance }) {
  return (
    <div className="ambulance-owner-card">
      {/* Owner Information */}
      <div className="owner-info-section">
        <div className="owner-header">
          <div className="owner-main-info">
            <div className="owner-title-row">
              <h2 className="owner-name">{ambulance.ownerName}</h2>
              {distance !== undefined && distance !== null && (
                <span className="distance-badge">📍 {formatDistance(distance)}</span>
              )}
            </div>
            <div className="owner-meta">
              <span className="location">📍 {ambulance.city}, {ambulance.postcode}</span>
              <span className="age">👤 Age: {ambulance.age}</span>
            </div>
            <div className="owner-contact">
              <span>📞 {ambulance.phone}</span>
              <span>✉️ {ambulance.email}</span>
            </div>
            <div className="owner-address">
              {ambulance.street}, {ambulance.city}, {ambulance.postcode}
            </div>
          </div>

          {ambulance.picture && (
            <div className="owner-picture">
              <img src={ambulance.picture} alt={ambulance.ownerName} />
            </div>
          )}
        </div>

        <div className="owner-actions">
          <button 
            className="action-btn btn-call"
            onClick={() => window.location.href = `tel:${ambulance.phone}`}
          >
            📞 Call Now
          </button>
          <button 
            className="action-btn btn-email"
            onClick={() => window.location.href = `mailto:${ambulance.email}`}
          >
            ✉️ Send Email
          </button>
        </div>
      </div>

      {/* Vehicle Fleet Section - Inner Cards */}
      {ambulance.vehicles && ambulance.vehicles.length > 0 && (
        <div className="vehicles-fleet-section">
          <h3 className="fleet-title">
            🚑 Ambulance Fleet ({ambulance.totalVehicles} vehicle{ambulance.totalVehicles !== 1 ? 's' : ''} - {ambulance.availableVehicles} available)
          </h3>
          <div className="vehicles-info-grid">
            {ambulance.vehicles.map((vehicle) => (
              <AmbulanceVehicleInfoCard
                key={vehicle._id}
                vehicle={vehicle}
              />
            ))}
          </div>
        </div>
      )}

      {/* No vehicles message */}
      {(!ambulance.vehicles || ambulance.vehicles.length === 0) && (
        <div className="no-vehicles-message">
          <p>No vehicles registered yet</p>
        </div>
      )}
    </div>
  );
}
