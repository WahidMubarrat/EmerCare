import React from 'react';

export default function AmbulanceVehicleInfoCard({ vehicle }) {
  return (
    <div className="vehicle-info-item">
      <div className="vehicle-info-header">
        <span className="vehicle-number">{vehicle.vehicleNumber}</span>
        <span className={`vehicle-status ${vehicle.isAvailable ? 'available' : 'unavailable'}`}>
          {vehicle.isAvailable ? '✓ Available' : '✗ Unavailable'}
        </span>
      </div>
      <div className="vehicle-info-details">
        <p><strong>Model:</strong> {vehicle.model} ({vehicle.year})</p>
        <p><strong>Driver:</strong> {vehicle.driverName}</p>
        <p><strong>Contact:</strong> {vehicle.driverPhone}</p>
      </div>
    </div>
  );
}
