import React, { useState } from 'react';
import LocationCapture from './LocationCapture';
import '../styles/AddressInput.css';

export default function AddressInput({ 
  addressData, 
  onAddressChange, 
  onLocationChange,
  errors 
}) {
  const [addressType, setAddressType] = useState('text'); // 'text' or 'location'

  const handleTypeChange = (type) => {
    setAddressType(type);
    
    // Clear opposite type data
    if (type === 'text') {
      onLocationChange(null);
    } else {
      onAddressChange({ street: '', city: '', postcode: '' });
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    onAddressChange({
      ...addressData,
      [name]: value
    });
  };

  const handleLocationCapture = (location, error) => {
    if (error) {
      onLocationChange(null, error);
    } else {
      onLocationChange(location);
    }
  };

  return (
    <div className="address-input-section">
      <h3 className="address-section-title">Address Information</h3>
      
      {/* Address Type Selector */}
      <div className="address-type-selector">
        <label className="type-option">
          <input
            type="radio"
            name="addressType"
            value="text"
            checked={addressType === 'text'}
            onChange={() => handleTypeChange('text')}
          />
          <span className="type-label">
            <span className="type-icon">📝</span>
            <span className="type-text">Enter Address Manually</span>
          </span>
        </label>

        <label className="type-option">
          <input
            type="radio"
            name="addressType"
            value="location"
            checked={addressType === 'location'}
            onChange={() => handleTypeChange('location')}
          />
          <span className="type-label">
            <span className="type-icon">📍</span>
            <span className="type-text">Use GPS Location</span>
          </span>
        </label>
      </div>

      {/* Text-based Address Input */}
      {addressType === 'text' && (
        <div className="text-address-fields">
          <div className="form-group">
            <label htmlFor="street">Street Address *</label>
            <input
              type="text"
              id="street"
              name="street"
              value={addressData.street}
              onChange={handleTextChange}
              placeholder="Street address, building number, etc."
              className={errors.street ? 'error' : ''}
            />
            {errors.street && <span className="error-message">{errors.street}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={addressData.city}
              onChange={handleTextChange}
              placeholder="Enter city"
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="postcode">Postcode *</label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              value={addressData.postcode}
              onChange={handleTextChange}
              placeholder="Enter postcode/ZIP code"
              className={errors.postcode ? 'error' : ''}
            />
            {errors.postcode && <span className="error-message">{errors.postcode}</span>}
          </div>
        </div>
      )}

      {/* GPS Location Capture */}
      {addressType === 'location' && (
        <div className="location-address-field">
          <LocationCapture
            onLocationCapture={handleLocationCapture}
            hasLocation={addressData.latitude !== null && addressData.longitude !== null}
            error={errors.location}
          />
        </div>
      )}
    </div>
  );
}
