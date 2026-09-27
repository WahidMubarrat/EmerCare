import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RegisterModal from '../components/RegisterModal';
import { getAllAmbulances, getAllDonors, getAllHospitals } from '../services/api';
import '../styles/LandingPage.css';

export default function LandingPage() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [networkStats, setNetworkStats] = useState({
    donors: 0,
    hospitals: 0,
    ambulances: 0,
    vehicles: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNetworkStats = async () => {
      try {
        const [donorResponse, hospitalResponse, ambulanceResponse] = await Promise.all([
          getAllDonors(),
          getAllHospitals(),
          getAllAmbulances()
        ]);

        const ambulances = ambulanceResponse.data || [];
        const vehicles = ambulances.reduce(
          (total, ambulance) => total + (ambulance.totalVehicles || ambulance.vehicles?.length || 0),
          0
        );

        setNetworkStats({
          donors: donorResponse.count ?? donorResponse.data?.length ?? 0,
          hospitals: hospitalResponse.count ?? hospitalResponse.data?.length ?? 0,
          ambulances: ambulanceResponse.count ?? ambulances.length,
          vehicles
        });
      } catch (error) {
        console.error('Unable to load landing page statistics:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchNetworkStats();
  }, []);

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

        <section className="network-stats" aria-labelledby="network-stats-title">
          <div className="network-stats-heading">
            <p className="section-kicker">Our growing network</p>
            <h2 id="network-stats-title">Support available when it matters</h2>
          </div>
          <div className="network-stats-grid">
            <div className="network-stat-card">
              <span className="network-stat-icon">🩸</span>
              <strong>{statsLoading ? '—' : networkStats.donors}</strong>
              <span>Registered Donors</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">🏥</span>
              <strong>{statsLoading ? '—' : networkStats.hospitals}</strong>
              <span>Registered Hospitals</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">🚑</span>
              <strong>{statsLoading ? '—' : networkStats.ambulances}</strong>
              <span>Ambulance Services</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">🚐</span>
              <strong>{statsLoading ? '—' : networkStats.vehicles}</strong>
              <span>Registered Vehicles</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <h2>EmerCare</h2>
            <p>Connecting people with hospitals, blood donors
                and emergency transport when every moment matters.</p>
          </div>

          <nav className="footer-column" aria-label="Explore EmerCare">
            <h3>Explore</h3>
            <button type="button" onClick={() => navigate('/hospitals')}>Hospitals</button>
            <button type="button" onClick={() => navigate('/donors')}>Blood donors</button>
            <button type="button" onClick={() => navigate('/ambulances')}>Ambulances</button>
          </nav>

          <nav className="footer-column" aria-label="Join EmerCare">
            <h3>Join the network</h3>
            <button type="button" onClick={() => setIsRegisterModalOpen(true)}>Register with EmerCare</button>
            <span>For hospitals, donors and ambulance owners</span>
            <span>Built for faster emergency response</span>
          </nav>

          <div className="footer-column footer-note">
            <h3>Emergency support</h3>
            <p>For urgent situations, contact your local emergency services first.</p>
            <p>EmerCare helps you find relevant care and resources.</p>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <p>Created by wmba</p>
          <p>© 2026 EmerCare. All rights reserved.</p>
        </div>
      </footer>

      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
