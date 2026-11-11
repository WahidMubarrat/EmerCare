import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterModal.css';

export default function RegisterModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDonor = () => {
    onClose();
    navigate('/register/donor');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>

        <h2 className="modal-title">Join EmerCare</h2>
        <p className="modal-subtitle">Register to help save lives</p>

        <div className="registration-options">
          <div className="option-item selected" onClick={handleDonor} style={{ cursor: 'pointer' }}>
            <div className="option-radio"><div className="radio-dot"></div></div>
            <div className="option-icon">🩸</div>
            <div className="option-content">
              <h3>Blood Donor</h3>
              <p>Stand with humanity — be a donor and save lives in emergencies</p>
            </div>
          </div>
        </div>

        <button className="proceed-btn" onClick={handleDonor}>
          Continue to Registration
        </button>
      </div>
    </div>
  );
}

