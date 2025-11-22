import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';
import AmbulanceOwnerInfoCard from '../components/AmbulanceOwnerInfoCard';
import { getAllAmbulances } from '../services/api';
import { calculateDistance } from '../utils/locationUtils';
import '../styles/AmbulanceList.css';

export default function AmbulanceList() {
  const [ambulances, setAmbulances] = useState([]);
  const [filteredAmbulances, setFilteredAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationSearch, setIsLocationSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      setLoading(true);
      const response = await getAllAmbulances();
      // Extract ambulance data from response
      const ambulanceData = response.data || [];
      // Sort alphabetically by owner name
      const sortedAmbulances = ambulanceData.sort((a, b) => 
        a.ownerName.localeCompare(b.ownerName)
      );
      setAmbulances(sortedAmbulances);
      setFilteredAmbulances(sortedAmbulances);
      setError(null);
    } catch (err) {
      setError('Failed to load ambulance services. Please try again later.');
      console.error('Error fetching ambulances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchParams) => {
    const { city, postcode, street, latitude, longitude } = searchParams;
    
    // Check if this is a location-based search
    if (latitude && longitude) {
      setUserLocation({ latitude, longitude });
      setIsLocationSearch(true);
      
      // Build query params with location
      const filters = {
        latitude,
        longitude,
        maxDistance: 50000 // 50km radius
      };
      
      fetchFilteredAmbulances(filters);
      return;
    }
    
    // Reset location search state for text-based search
    setUserLocation(null);
    setIsLocationSearch(false);
    
    // If all fields are empty, fetch all ambulances
    if (!city && !postcode && !street) {
      fetchAmbulances();
      return;
    }

    // Build query params object
    const filters = {};
    if (city) filters.city = city;
    if (postcode) filters.postcode = postcode;
    if (street) filters.street = street;

    // Fetch filtered ambulances from backend
    fetchFilteredAmbulances(filters);
  };

  const fetchFilteredAmbulances = async (filters) => {
    try {
      setLoading(true);
      const response = await getAllAmbulances(filters);
      const ambulanceData = response.data || [];
      
      // If location search, calculate distances and sort by proximity
      if (userLocation && filters.latitude && filters.longitude) {
        const ambulancesWithDistance = ambulanceData.map(ambulance => ({
          ...ambulance,
          distance: ambulance.location?.coordinates 
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                ambulance.location.coordinates[1], // latitude
                ambulance.location.coordinates[0]  // longitude
              )
            : null
        }));
        
        // Sort by distance (closest first)
        const sortedAmbulances = ambulancesWithDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        
        setFilteredAmbulances(sortedAmbulances);
      } else {
        // Text-based search - sort alphabetically
        const sortedAmbulances = ambulanceData.sort((a, b) => 
          a.ownerName.localeCompare(b.ownerName)
        );
        setFilteredAmbulances(sortedAmbulances);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to search ambulance services. Please try again.');
      console.error('Error searching ambulances:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ambulance-list-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading ambulance services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ambulance-list-page">
      <Navbar />
      <BackButton />
      
      <main className="ambulance-list-content">
        <div className="ambulance-list-header">
          <h1>Ambulance Services</h1>
          <p className="subtitle">Find verified ambulance services for emergency transport</p>
          
          <SearchBar 
            onSearch={handleSearch}
            type="ambulance"
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {filteredAmbulances.length === 0 ? (
          <div className="no-results">
            <p>No ambulance services found matching your search.</p>
          </div>
        ) : (
          <div className="ambulance-list">
            <div className="ambulance-count">
              Showing {filteredAmbulances.length} ambulance service{filteredAmbulances.length !== 1 ? 's' : ''}
              {isLocationSearch && <span className="location-indicator"> • Sorted by distance</span>}
            </div>
            
            {filteredAmbulances.map((ambulance) => (
              <AmbulanceOwnerInfoCard
                key={ambulance._id}
                ambulance={ambulance}
                distance={ambulance.distance}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
