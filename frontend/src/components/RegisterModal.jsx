import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterModal.css';

export default function RegisterModal({ isOpen, onClose }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProceed = () => {
    if (selectedOption) {
      onClose();
      
      // Navigate based on selection
      if (selectedOption === 'Blood Donor') {
        navigate('/register/donor');
      } else if (selectedOption === 'Hospital') {
        navigate('/register/hospital');
      } else if (selectedOption === 'Ambulance Owner') {
        navigate('/register/ambulance');
      }
    } else {
      alert('Please select a registration type');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">Register As</h2>
        <p className="modal-subtitle">Choose your registration type</p>
        
        <div className="registration-options">
          <div 
            className={`option-item ${selectedOption === 'Hospital' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('Hospital')}
          >
            <div className="option-radio">
              <div className="radio-dot"></div>
            </div>
            <div className="option-icon">🏥</div>
            <div className="option-content">
              <h3>Hospital</h3>
              <p>Register your hospital and manage services</p>
            </div>
          </div>

          <div 
            className={`option-item ${selectedOption === 'Blood Donor' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('Blood Donor')}
          >
            <div className="option-radio">
              <div className="radio-dot"></div>
            </div>
            <div className="option-icon">🩸</div>
            <div className="option-content">
              <h3>Blood Donor</h3>
              <p>Stand with humanity — be a donor</p>
            </div>
          </div>

          <div 
            className={`option-item ${selectedOption === 'Ambulance Owner' ? 'selected' : ''}`}
            onClick={() => setSelectedOption('Ambulance Owner')}
          >
            <div className="option-radio">
              <div className="radio-dot"></div>
            </div>
            <div className="option-icon">🚑</div>
            <div className="option-content">
              <h3>Ambulance Owner</h3>
              <p>Register your ambulance service</p>
            </div>
          </div>
        </div>

        <button 
          className="proceed-btn" 
          onClick={handleProceed}
          disabled={!selectedOption}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
