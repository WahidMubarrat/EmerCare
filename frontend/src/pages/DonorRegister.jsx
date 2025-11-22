import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AddressInput from '../components/AddressInput';
import { registerDonor } from '../services/api';
import { validatePassword } from '../utils/passwordValidation';
import '../styles/DonorRegister.css';

export default function DonorRegister() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    street: '',
    city: '',
    postcode: '',
    latitude: null,
    longitude: null,
    bloodGroup: '',
    age: '',
    picture: null
  });

  const [errors, setErrors] = useState({});
  const [picturePreview, setPicturePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 65) {
      newErrors.age = 'Age must be between 18 and 65';
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

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
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
        const response = await registerDonor(formData);
        alert(response.message || 'Registration successful! Thank you for becoming a blood donor.');
        
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          password: '',
          street: '',
          city: '',
          postcode: '',
          latitude: null,
          longitude: null,
          bloodGroup: '',
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
    <div className="donor-register-page">
      <Navbar />
      
      <div className="donor-register-container">
        <div className="register-header">
          <div className="header-icon">🩸</div>
          <h1>Blood Donor Registration</h1>
          
        </div>

        <form className="donor-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
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
              max="65"
              className={errors.age ? 'error' : ''}
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
            <small className="field-hint">Donors must be between 18-65 years old</small>
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
            <label htmlFor="bloodGroup">Blood Group *</label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className={errors.bloodGroup ? 'error' : ''}
            >
              <option value="">Select your blood group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            {errors.bloodGroup && <span className="error-message">{errors.bloodGroup}</span>}
          </div>

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
            {isSubmitting ? 'Registering...' : 'Register as Donor'}
          </button>
        </form>

        <div className="info-section">
          <h3>Why Donate Blood?</h3>
          <ul>
            <li>Regular health check-up benefits</li>
            <li>Reduce risk of heart disease</li>
            <li>Make a difference in your community</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
