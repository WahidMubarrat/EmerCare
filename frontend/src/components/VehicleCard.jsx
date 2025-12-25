import React, { useState } from 'react';
import '../styles/VehicleCard.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function VehicleCard({ vehicle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    vehicleNumber: vehicle.vehicleNumber,
    model: vehicle.model,
    year: vehicle.year,
    driverName: vehicle.driverName,
    driverPhone: vehicle.driverPhone
  });
  const [isAvailable, setIsAvailable] = useState(vehicle.isAvailable);
  const [updating, setUpdating] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const response = await fetch(`${BASE_URL}/api/ambulance-vehicles/${vehicle._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update vehicle');
      }

      alert('Vehicle updated successfully!');
      onUpdate(data.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update vehicle: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ambulance?')) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/ambulance-vehicles/${vehicle._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete vehicle');
      }

      alert('Vehicle deleted successfully!');
      onDelete(vehicle._id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete vehicle: ' + error.message);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newAvailability = !isAvailable;
      const response = await fetch(`${BASE_URL}/api/ambulance-vehicles/${vehicle._id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: newAvailability })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update availability');
      }

      setIsAvailable(newAvailability);
      onUpdate(data.data);
    } catch (error) {
      console.error('Toggle availability error:', error);
      alert('Failed to update availability: ' + error.message);
    }
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-header">
        <div className="vehicle-number-badge">
          🚑 {isEditing ? (
            <input
              type="text"
              name="vehicleNumber"
              value={editData.vehicleNumber}
              onChange={handleEditChange}
              className="edit-inline"
            />
          ) : (
            vehicle.vehicleNumber
          )}
        </div>
        <span className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? '✓ Available' : '✗ Unavailable'}
        </span>
      </div>

      <div className="vehicle-details">
        <div className="detail-row">
          <label>Model:</label>
          {isEditing ? (
            <input
              type="text"
              name="model"
              value={editData.model}
              onChange={handleEditChange}
              className="edit-input"
            />
          ) : (
            <span>{vehicle.model}</span>
          )}
        </div>

        <div className="detail-row">
          <label>Year:</label>
          {isEditing ? (
            <input
              type="number"
              name="year"
              value={editData.year}
              onChange={handleEditChange}
              className="edit-input"
            />
          ) : (
            <span>{vehicle.year}</span>
          )}
        </div>

        <div className="detail-row">
          <label>Driver:</label>
          {isEditing ? (
            <input
              type="text"
              name="driverName"
              value={editData.driverName}
              onChange={handleEditChange}
              className="edit-input"
            />
          ) : (
            <span>{vehicle.driverName}</span>
          )}
        </div>

        <div className="detail-row">
          <label>Driver Phone:</label>
          {isEditing ? (
            <input
              type="tel"
              name="driverPhone"
              value={editData.driverPhone}
              onChange={handleEditChange}
              className="edit-input"
            />
          ) : (
            <span>{vehicle.driverPhone}</span>
          )}
        </div>
      </div>

      <div className="vehicle-documents">
        <h4>Documents:</h4>
        <div className="document-links">
          <a href={vehicle.registrationPaper} target="_blank" rel="noopener noreferrer" className="doc-link">
            📄 Registration
          </a>
          <a href={vehicle.driverLicense} target="_blank" rel="noopener noreferrer" className="doc-link">
            🪪 License
          </a>
          <a href={vehicle.fitnessPaper} target="_blank" rel="noopener noreferrer" className="doc-link">
            ✅ Fitness
          </a>
        </div>
      </div>

      <div className="vehicle-actions">
        <button 
          className={`btn-toggle ${isAvailable ? 'btn-unavailable' : 'btn-available'}`}
          onClick={toggleAvailability}
        >
          {isAvailable ? 'Mark Unavailable' : 'Mark Available'}
        </button>

        {!isEditing ? (
          <>
            <button className="btn-edit" onClick={() => setIsEditing(true)}>
              ✏️ Edit
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              🗑️ Delete
            </button>
          </>
        ) : (
          <>
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave} disabled={updating}>
              {updating ? 'Saving...' : 'Save'}
            </button>
          </>
        )}
      </div>

      <div className="vehicle-meta">
        <small>Added: {new Date(vehicle.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  );
}
