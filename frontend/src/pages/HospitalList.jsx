import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';
import HospitalCard from '../components/HospitalCard';
import { getAllHospitals } from '../services/api';
import { calculateDistance } from '../utils/locationUtils';
import '../styles/HospitalList.css';

export default function HospitalList() {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationSearch, setIsLocationSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await getAllHospitals();
      // Extract hospital data from response
      const hospitalData = response.data || [];
      // Sort alphabetically by hospital name
      const sortedHospitals = hospitalData.sort((a, b) => 
        a.hospitalName.localeCompare(b.hospitalName)
      );
      setHospitals(sortedHospitals);
      setFilteredHospitals(sortedHospitals);
      // Save to localStorage for detail page access
      localStorage.setItem('hospitals', JSON.stringify(sortedHospitals));
      setError(null);
    } catch (err) {
      setError('Failed to load hospitals. Please try again later.');
      console.error('Error fetching hospitals:', err);
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
      
      fetchFilteredHospitals(filters);
      return;
    }
    
    // Reset location search state for text-based search
    setUserLocation(null);
    setIsLocationSearch(false);
    
    // If all fields are empty, fetch all hospitals
    if (!city && !postcode && !street) {
      fetchHospitals();
      return;
    }

    // Build query params object
    const filters = {};
    if (city) filters.city = city;
    if (postcode) filters.postcode = postcode;
    if (street) filters.street = street;

    // Fetch filtered hospitals from backend
    fetchFilteredHospitals(filters);
  };

  const fetchFilteredHospitals = async (filters) => {
    try {
      setLoading(true);
      const response = await getAllHospitals(filters);
      const hospitalData = response.data || [];
      
      // If location search, calculate distances and sort by proximity
      if (userLocation && filters.latitude && filters.longitude) {
        const hospitalsWithDistance = hospitalData.map(hospital => ({
          ...hospital,
          distance: hospital.location?.coordinates 
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                hospital.location.coordinates[1], // latitude
                hospital.location.coordinates[0]  // longitude
              )
            : null
        }));
        
        // Sort by distance (closest first)
        const sortedHospitals = hospitalsWithDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        
        setFilteredHospitals(sortedHospitals);
      } else {
        // Text-based search - sort alphabetically
        const sortedHospitals = hospitalData.sort((a, b) => 
          a.hospitalName.localeCompare(b.hospitalName)
        );
        setFilteredHospitals(sortedHospitals);
      }
      
      // Update localStorage with filtered results
      localStorage.setItem('hospitals', JSON.stringify(hospitalData));
      setError(null);
    } catch (err) {
      setError('Failed to search hospitals. Please try again.');
      console.error('Error searching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewServices = (hospitalId) => {
    navigate(`/hospital/${hospitalId}/services`);
  };

  const handleViewReviews = (hospitalId) => {
    navigate(`/hospital/${hospitalId}/reviews`);
  };

  const handleViewDetails = (hospitalId) => {
    navigate(`/hospital/${hospitalId}`);
  };

  if (loading) {
    return (
      <div className="hospital-list-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-list-page">
      <Navbar />
      <BackButton />
      
      <main className="hospital-list-content">
        <div className="hospital-list-header">
          <h1>Registered Hospitals</h1>
          <p className="subtitle">Browse hospitals by location - Search by city, postcode, or street</p>
        </div>

        <SearchBar onSearch={handleSearch} type="hospital" />

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {filteredHospitals.length === 0 ? (
          <div className="no-results">
            <p>No hospitals found matching your search criteria.</p>
          </div>
        ) : (
          <div className="hospital-list">
            <div className="hospital-count">
              Showing {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''}
              {isLocationSearch && <span className="location-indicator"> • Sorted by distance</span>}
            </div>
            
            {filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital._id}
                hospital={hospital}
                distance={hospital.distance}
                onViewDetails={handleViewDetails}
                onViewServices={handleViewServices}
                onViewReviews={handleViewReviews}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
