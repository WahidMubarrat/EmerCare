import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AddressInput from '../components/AddressInput';
import { registerHospital } from '../services/api';
import { validatePassword } from '../utils/passwordValidation';
import '../styles/HospitalRegister.css';

export default function HospitalRegister() {
  const [formData, setFormData] = useState({
    hospitalName: '',
    phone: '',
    email: '',
    password: '',
    street: '',
    city: '',
    postcode: '',
    latitude: null,
    longitude: null,
    license: null
  });

  const [errors, setErrors] = useState({});
  const [licensePreview, setLicensePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {``
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
      // Validate file type (images and PDFs)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          license: 'Please upload an image or PDF file'
        }));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          license: 'File size should be less than 10MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        license: file
      }));

      // Create preview for images only
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLicensePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setLicensePreview('pdf');
      }

      // Clear error
      if (errors.license) {
        setErrors(prev => ({
          ...prev,
          license: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Hospital name is required';
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

    if (!formData.license) {
      newErrors.license = 'License document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await registerHospital(formData);
        alert(response.message || 'Registration successful! Your hospital will be verified and activated soon.');
        
        // Reset form
        setFormData({
          hospitalName: '',
          phone: '',
          email: '',
          password: '',
          street: '',
          city: '',
          postcode: '',
          latitude: null,
          longitude: null,
          license: null
        });
        setLicensePreview(null);
      } catch (error) {
        alert(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="hospital-register-page">
      <Navbar />
      
      <div className="hospital-register-container">
        <div className="register-header">
          <div className="header-icon">🏥</div>
          <h1>Hospital Registration</h1>
          <p>Register your hospital and provide healthcare services</p>
        </div>

        <form className="hospital-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="hospitalName">Hospital Name *</label>
            <input
              type="text"
              id="hospitalName"
              name="hospitalName"
              value={formData.hospitalName}
              onChange={handleChange}
              placeholder="Enter hospital name"
              className={errors.hospitalName ? 'error' : ''}
            />
            {errors.hospitalName && <span className="error-message">{errors.hospitalName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter hospital phone number"
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
              placeholder="Enter hospital email"
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
            <label htmlFor="license">Hospital License Document *</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="license"
                name="license"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className={`file-input ${errors.license ? 'error' : ''}`}
              />
              <label htmlFor="license" className="file-label">
                {formData.license ? 'Change Document' : 'Upload License'}
              </label>
              {licensePreview && licensePreview !== 'pdf' && (
                <div className="image-preview">
                  <img src={licensePreview} alt="License Preview" />
                </div>
              )}
              {licensePreview === 'pdf' && (
                <div className="pdf-indicator">
                  <span>📄 PDF Document Uploaded: {formData.license?.name}</span>
                </div>
              )}
            </div>
            {errors.license && <span className="error-message">{errors.license}</span>}
            <small className="field-hint">Upload license certificate (Image or PDF, max 10MB)</small>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Hospital'}
          </button>
        </form>

        <div className="info-section">
          <h3>Why Register Your Hospital?</h3>
          <ul>
            <li>Reach more patients in need of care</li>
            <li>Showcase real-time service availability</li>
            <li>Build trust through verified reviews</li>
            <li>Improve emergency response coordination</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
