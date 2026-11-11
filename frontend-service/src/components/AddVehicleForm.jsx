import React, { useState } from 'react';
import '../styles/AddVehicleForm.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AddVehicleForm({ ownerId, onVehicleAdded, onCancel }) {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    model: '',
    year: '',
    driverName: '',
    driverPhone: ''
  });

  const [documents, setDocuments] = useState({
    registrationPaper: null,
    driverLicense: null,
    fitnessPaper: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDocuments(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.vehicleNumber || !formData.model || !formData.year || 
        !formData.driverName || !formData.driverPhone) {
      setError('All fields are required');
      return;
    }

    if (!documents.registrationPaper || !documents.driverLicense || !documents.fitnessPaper) {
      setError('All documents are required');
      return;
    }

    try {
      setLoading(true);

      // Convert files to base64
      const [registrationBase64, licenseBase64, fitnessBase64] = await Promise.all([
        fileToBase64(documents.registrationPaper),
        fileToBase64(documents.driverLicense),
        fileToBase64(documents.fitnessPaper)
      ]);

      const response = await fetch(`${BASE_URL}/api/ambulance-vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId,
          ...formData,
          year: parseInt(formData.year),
          registrationPaper: registrationBase64,
          driverLicense: licenseBase64,
          fitnessPaper: fitnessBase64
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add vehicle');
      }

      alert('Ambulance vehicle added successfully!');
      onVehicleAdded(data.data);
      
      // Reset form
      setFormData({
        vehicleNumber: '',
        model: '',
        year: '',
        driverName: '',
        driverPhone: ''
      });
      setDocuments({
        registrationPaper: null,
        driverLicense: null,
        fitnessPaper: null
      });

    } catch (error) {
      console.error('Add vehicle error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-vehicle-form">
      <div className="form-header">
        <h2>Add New Ambulance</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="vehicleNumber">Vehicle Registration Number *</label>
            <input
              type="text"
              id="vehicleNumber"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              placeholder="e.g., DHA-12345"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Vehicle Model *</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g., Toyota Hiace"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year">Manufacturing Year *</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="e.g., 2020"
              min="1990"
              max={new Date().getFullYear()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="driverName">Driver Name *</label>
            <input
              type="text"
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleInputChange}
              placeholder="Enter driver's full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="driverPhone">Driver Phone *</label>
            <input
              type="tel"
              id="driverPhone"
              name="driverPhone"
              value={formData.driverPhone}
              onChange={handleInputChange}
              placeholder="Enter driver's phone number"
              required
            />
          </div>
        </div>

        <div className="documents-section">
          <h3>Required Documents</h3>
          
          <div className="form-group-file">
            <label htmlFor="registrationPaper">
              <span className="file-label-text">📄 Vehicle Registration Paper *</span>
              <span className="file-name">
                {documents.registrationPaper ? documents.registrationPaper.name : 'No file chosen'}
              </span>
            </label>
            <input
              type="file"
              id="registrationPaper"
              name="registrationPaper"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              required
            />
          </div>

          <div className="form-group-file">
            <label htmlFor="driverLicense">
              <span className="file-label-text">🪪 Driver's License *</span>
              <span className="file-name">
                {documents.driverLicense ? documents.driverLicense.name : 'No file chosen'}
              </span>
            </label>
            <input
              type="file"
              id="driverLicense"
              name="driverLicense"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              required
            />
          </div>

          <div className="form-group-file">
            <label htmlFor="fitnessPaper">
              <span className="file-label-text">✅ Vehicle Fitness Certificate *</span>
              <span className="file-name">
                {documents.fitnessPaper ? documents.fitnessPaper.name : 'No file chosen'}
              </span>
            </label>
            <input
              type="file"
              id="fitnessPaper"
              name="fitnessPaper"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Adding...' : '+ Add Ambulance'}
          </button>
        </div>
      </form>
    </div>
  );
}
