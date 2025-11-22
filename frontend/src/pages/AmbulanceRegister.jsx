import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AddressInput from '../components/AddressInput';
import { registerAmbulance } from '../services/api';
import { validatePassword } from '../utils/passwordValidation';
import '../styles/AmbulanceRegister.css';

export default function AmbulanceRegister() {
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    street: '',
    city: '',
    postcode: '',
    latitude: null,
    longitude: null,
    age: '',
    picture: null
  });

  const [errors, setErrors] = useState({});
  const [picturePreview, setPicturePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddressChange = (addressData) => {
    setFormData(prev => ({
      ...prev,
      street: addressData.street,
      city: addressData.city,
      postcode: addressData.postcode
    }));
    // Clear address errors
    setErrors(prev => ({
      ...prev,
      street: '',
      city: '',
      postcode: '',
      location: ''
    }));
  };

  const handleLocationChange = (location, error) => {
    if (error) {
      setErrors(prev => ({
        ...prev,
        location: error
      }));
      setFormData(prev => ({
        ...prev,
        latitude: null,
        longitude: null
      }));
    } else if (location) {
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        street: location.address || '',
        city: location.city || '',
        postcode: location.postcode || ''
      }));
      setErrors(prev => ({
        ...prev,
        location: '',
        street: '',
        city: '',
        postcode: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          picture: 'Please upload an image file'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          picture: 'Image size should be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        picture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.picture) {
        setErrors(prev => ({
          ...prev,
          picture: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else {
      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.valid) {
        newErrors.password = passwordCheck.message;
      }
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 70) {
      newErrors.age = 'Age must be between 18 and 70';
    }

    // Check if either text address or GPS location is provided
    const hasTextAddress = formData.street.trim() || formData.city.trim() || formData.postcode.trim();
    const hasGPSLocation = formData.latitude !== null && formData.longitude !== null;

    if (!hasTextAddress && !hasGPSLocation) {
      newErrors.location = 'Please provide either a text address or capture GPS location';
    }

    // Validate text address fields if text address is being used
    if (hasTextAddress && !hasGPSLocation) {
      if (!formData.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.postcode.trim()) {
        newErrors.postcode = 'Postcode is required';
      }
    }

    if (!formData.picture) {
      newErrors.picture = 'Profile picture is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await registerAmbulance(formData);
        alert(response.message || 'Registration successful! Your ambulance service will be verified and activated soon.');
        
        // Reset form
        setFormData({
          ownerName: '',
          phone: '',
          email: '',
          password: '',
          street: '',
          city: '',
          postcode: '',
          latitude: null,
          longitude: null,
          age: '',
          picture: null
        });
        setPicturePreview(null);
      } catch (error) {
        alert(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="ambulance-register-page">
      <Navbar />
      
      <div className="ambulance-register-container">
        <div className="register-header">
          <div className="header-icon">🚑</div>
          <h1>Ambulance Service Registration</h1>
          <p>Register your ambulance and help  faster</p>
        </div>

        <form className="ambulance-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ownerName">Owner Name *</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Enter owner's full name"
              className={errors.ownerName ? 'error' : ''}
            />
            {errors.ownerName && <span className="error-message">{errors.ownerName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">Age *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              min="18"
              max="70"
              className={errors.age ? 'error' : ''}
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
            <small className="field-hint">Owner must be between 18-70 years old</small>
          </div>

          <AddressInput
            addressData={{
              street: formData.street,
              city: formData.city,
              postcode: formData.postcode,
              latitude: formData.latitude,
              longitude: formData.longitude
            }}
            onAddressChange={handleAddressChange}
            onLocationChange={handleLocationChange}
            errors={{
              street: errors.street,
              city: errors.city,
              postcode: errors.postcode,
              location: errors.location
            }}
          />

          <div className="form-group">
            <label htmlFor="picture">Profile Picture *</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="picture"
                name="picture"
                accept="image/*"
                onChange={handleFileChange}
                className={`file-input ${errors.picture ? 'error' : ''}`}
              />
              <label htmlFor="picture" className="file-label">
                {picturePreview ? 'Change Picture' : 'Choose Picture'}
              </label>
              {picturePreview && (
                <div className="image-preview">
                  <img src={picturePreview} alt="Preview" />
                </div>
              )}
            </div>
            {errors.picture && <span className="error-message">{errors.picture}</span>}
            <small className="field-hint">Upload a clear photo (max 5MB)</small>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Ambulance Service'}
          </button>
        </form>

        <div className="info-section">
          <h3>Why Register Your Ambulance?</h3>
          <ul>
            <li>Be part of emergency response network</li>
            <li>Reach patients in critical need faster</li>
            <li>Build credibility through verified service</li>
            <li>Increase visibility in your service area</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
