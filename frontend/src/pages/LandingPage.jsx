import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RegisterModal from '../components/RegisterModal';
import '../styles/LandingPage.css';

export default function LandingPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <Navbar />
      
      <main className="landing-content">
        <section className="hero-section">
          <h2 className="hero-title">Find Healthcare When You Need It Most</h2>
          <p className="hero-subtitle">
            Real-time hospital availability, blood donors, and emergency care information at your fingertips
          </p>
          
          <div className="hero-actions">
            <button 
              className="hero-btn hero-btn-primary"
              onClick={() => navigate('/hospitals')}
            >
              Find Hospitals
            </button>
            <button 
              className="hero-btn hero-btn-secondary"
              onClick={() => setIsRegisterModalOpen(true)}
            >
              Register
            </button>
          </div>
        </section>

        <section className="features-section">
          <div className="feature-card" onClick={() => navigate('/ambulances')} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🚑</div>
            <h3>Ambulance Services</h3>
            <p>Find verified ambulance services near you for emergency transport</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/hospitals')} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🏥</div>
            <h3>Hospital Network</h3>
            <p>Search hospitals by location, check availability, and read verified reviews</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/donors')} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🩸</div>
            <h3>Blood Donor Network</h3>
            <p>Connect with blood donors in your area during emergencies</p>
          </div>
        </section>
      </main>

      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
