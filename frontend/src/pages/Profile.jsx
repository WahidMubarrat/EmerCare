import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Profile.css';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="profile-page">
      <Navbar />
      
      <div className="profile-container">
        <div className="profile-placeholder">
          <div className="placeholder-icon">👤</div>
          <h1>Profile Page</h1>
          <p>Your profile page is coming soon!</p>
          <p className="placeholder-text">
            This is where you'll be able to view and manage your account information,
            see your activity, and update your preferences.
          </p>
          <button className="back-home-btn" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
