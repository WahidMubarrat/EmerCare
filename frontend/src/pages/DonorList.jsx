import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';
import DonorCard from '../components/DonorCard';
import { getAllDonors } from '../services/api';
import { calculateDistance } from '../utils/locationUtils';
import '../styles/DonorList.css';

export default function DonorList() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationSearch, setIsLocationSearch] = useState(false);
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await getAllDonors();
      // Extract donor data from response
      const donorData = response.data || [];
      // Sort alphabetically by donor name
      const sortedDonors = donorData.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      setDonors(sortedDonors);
      setFilteredDonors(sortedDonors);
      setError(null);
    } catch (err) {
      setError('Failed to load donors. Please try again later.');
      console.error('Error fetching donors:', err);
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
      
      if (filterBloodGroup) filters.bloodGroup = filterBloodGroup;
      
      fetchFilteredDonors(filters);
      return;
    }
    
    // Reset location search state for text-based search
    setUserLocation(null);
    setIsLocationSearch(false);
    
    // If all fields are empty and no blood group filter, fetch all donors
    if (!city && !postcode && !street && !filterBloodGroup) {
      fetchDonors();
      return;
    }

    // Build query params object
    const filters = {};
    if (city) filters.city = city;
    if (postcode) filters.postcode = postcode;
    if (street) filters.street = street;
    if (filterBloodGroup) filters.bloodGroup = filterBloodGroup;

    // Fetch filtered donors from backend
    fetchFilteredDonors(filters);
  };

  const fetchFilteredDonors = async (filters) => {
    try {
      setLoading(true);
      const response = await getAllDonors(filters);
      const donorData = response.data || [];
      
      // If location search, calculate distances and sort by proximity
      if (userLocation && filters.latitude && filters.longitude) {
        const donorsWithDistance = donorData.map(donor => ({
          ...donor,
          distance: donor.location?.coordinates 
            ? calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                donor.location.coordinates[1], // latitude
                donor.location.coordinates[0]  // longitude
              )
            : null
        }));
        
        // Sort by distance (closest first)
        const sortedDonors = donorsWithDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        
        setFilteredDonors(sortedDonors);
      } else {
        // Text-based search - sort alphabetically
        const sortedDonors = donorData.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        setFilteredDonors(sortedDonors);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to search donors. Please try again.');
      console.error('Error searching donors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBloodGroupChange = (e) => {
    const bloodGroup = e.target.value;
    setFilterBloodGroup(bloodGroup);
    
    // Trigger search with current blood group filter
    const filters = {};
    if (bloodGroup) filters.bloodGroup = bloodGroup;
    
    if (Object.keys(filters).length > 0) {
      fetchFilteredDonors(filters);
    } else {
      fetchDonors();
    }
  };

  if (loading) {
    return (
      <div className="donor-list-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blood donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="donor-list-page">
      <Navbar />
      <BackButton />
      
      <main className="donor-list-content">
        <div className="donor-list-header">
          <h1>Blood Donor Network</h1>
          <p className="subtitle">Connect with verified blood donors in your area</p>
          
          <SearchBar 
            onSearch={handleSearch}
            type="donor"
          />
          
          <div className="blood-group-filter">
            <select
              value={filterBloodGroup}
              onChange={handleBloodGroupChange}
              className="blood-group-select"
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {filteredDonors.length === 0 ? (
          <div className="no-results">
            <p>No donors found matching your criteria.</p>
          </div>
        ) : (
          <div className="donor-list">
            <div className="donor-count">
              Showing {filteredDonors.length} donor{filteredDonors.length !== 1 ? 's' : ''}
              {isLocationSearch && <span className="location-indicator"> • Sorted by distance</span>}
            </div>
            
            {filteredDonors.map((donor) => (
              <DonorCard
                key={donor._id}
                donor={donor}
                distance={donor.distance}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
