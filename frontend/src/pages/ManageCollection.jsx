import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import AddVehicleForm from '../components/AddVehicleForm';
import VehicleCard from '../components/VehicleCard';
import '../styles/ManageCollection.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManageCollection() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.userType !== 'ambulance') {
      navigate('/');
      return;
    }

    setUserData(user);
    fetchVehicles(user.id);
  }, [navigate]);

  const fetchVehicles = async (ownerId) => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/ambulance-vehicles/owner/${ownerId}`);
      const data = await response.json();

      if (response.ok) {
        setVehicles(data.data || []);
      } else {
        console.error('Failed to fetch vehicles:', data.message);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleAdded = (newVehicle) => {
    setVehicles(prev => [newVehicle, ...prev]);
    setShowAddForm(false);
  };

  const handleVehicleDeleted = (vehicleId) => {
    setVehicles(prev => prev.filter(v => v._id !== vehicleId));
  };

  const handleVehicleUpdated = (updatedVehicle) => {
    setVehicles(prev => prev.map(v => 
      v._id === updatedVehicle._id ? updatedVehicle : v
    ));
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manage-collection-page">
      <Navbar />
      <BackButton />

      <main className="collection-content">
        <div className="collection-header">
          <div className="header-text">
            <h1>🚑 Manage Ambulance Collection</h1>
            <p className="subtitle">
              Add, edit, or remove ambulances from your fleet
            </p>
          </div>
          <button 
            className="btn-add-vehicle" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '✕ Cancel' : '+ Add New Ambulance'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-form-container">
            <AddVehicleForm
              ownerId={userData.id}
              onVehicleAdded={handleVehicleAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        <div className="collection-stats">
          <div className="stat-card">
            <div className="stat-number">{vehicles.length}</div>
            <div className="stat-label">Total Ambulances</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {vehicles.filter(v => v.isAvailable).length}
            </div>
            <div className="stat-label">Available</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {vehicles.filter(v => !v.isAvailable).length}
            </div>
            <div className="stat-label">Unavailable</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="no-vehicles">
            <div className="empty-state">
              <span className="empty-icon">🚑</span>
              <h3>No Ambulances Yet</h3>
              <p>Start building your fleet by adding your first ambulance</p>
              <button 
                className="btn-add-first" 
                onClick={() => setShowAddForm(true)}
              >
                + Add Your First Ambulance
              </button>
            </div>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onDelete={handleVehicleDeleted}
                onUpdate={handleVehicleUpdated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
