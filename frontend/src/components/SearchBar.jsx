import React, { useState } from 'react';
import { getUserLocation } from '../utils/locationUtils';
import '../styles/SearchBar.css';

export default function SearchBar({ onSearch, type = 'hospital' }) {
  const [searchParams, setSearchParams] = useState({
    city: '',
    postcode: '',
    street: ''
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleNearMe = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getUserLocation();
      onSearch({
        latitude: location.latitude,
        longitude: location.longitude,
        nearMe: true
      });
      // Clear text search fields when using location
      setSearchParams({
        city: '',
        postcode: '',
        street: ''
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleClear = () => {
    setSearchParams({
      city: '',
      postcode: '',
      street: ''
    });
    onSearch({
      city: '',
      postcode: '',
      street: ''
    });
  };

  const placeholders = {
    hospital: 'Search hospitals...',
    donor: 'Search donors...',
    ambulance: 'Search ambulances...'
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-inputs">
          <div className="search-input-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={searchParams.city}
              onChange={handleInputChange}
              placeholder="Enter city name"
              className="search-input"
            />
          </div>

          <div className="search-input-group">
            <label htmlFor="postcode">Postcode</label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              value={searchParams.postcode}
              onChange={handleInputChange}
              placeholder="Enter postcode"
              className="search-input"
            />
          </div>

          <div className="search-input-group">
            <label htmlFor="street">Street</label>
            <input
              type="text"
              id="street"
              name="street"
              value={searchParams.street}
              onChange={handleInputChange}
              placeholder="Enter street name/number"
              className="search-input"
            />
          </div>
        </div>

        <div className="search-actions">
          <button 
            type="button" 
            onClick={handleNearMe} 
            className="btn-near-me"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? '📍 Getting Location...' : '📍 Near Me'}
          </button>
          <button type="submit" className="btn-search">
            🔍 Search
          </button>
          <button type="button" onClick={handleClear} className="btn-clear">
            ✕ Clear
          </button>
        </div>
      </form>
    </div>
  );
}
