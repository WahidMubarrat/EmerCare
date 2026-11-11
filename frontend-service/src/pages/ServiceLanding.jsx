import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceNavbar from '../components/ServiceNavbar';
import SignIn from '../components/SignIn';
import { getAllHospitals, getAllAmbulances } from '../services/api';
import '../styles/LandingPage.css';

export default function ServiceLanding() {
  const navigate = useNavigate();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [stats, setStats] = useState({ hospitals: 0, ambulances: 0, vehicles: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hospitalRes, ambulanceRes] = await Promise.all([
          getAllHospitals(),
          getAllAmbulances(),
        ]);
        const ambulances = ambulanceRes.data || [];
        const vehicles = ambulances.reduce(
          (total, a) => total + (a.totalVehicles || a.vehicles?.length || 0), 0
        );
        setStats({
          hospitals: hospitalRes.count ?? hospitalRes.data?.length ?? 0,
          ambulances: ambulanceRes.count ?? ambulances.length,
          vehicles,
        });
      } catch {
        // stats are non-critical
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="landing-page">
      <ServiceNavbar />

      <main className="landing-content">

        {/* Hero */}
        <section className="hero-section">
          <h2 className="hero-title">Join the EmerCare Network</h2>
          <p className="hero-subtitle">
            Register your hospital or ambulance service and help people find care when it matters most.
          </p>
          <div className="hero-actions">
            <button className="hero-btn hero-btn-primary" onClick={() => setIsSignInOpen(true)}>
              Sign In to Dashboard
            </button>
            <button className="hero-btn hero-btn-secondary" onClick={() => navigate('/register/hospital')}>
              Register Now
            </button>
          </div>
        </section>

        {/* Register cards */}
        <section className="features-section">
          <div className="feature-card" onClick={() => navigate('/register/hospital')} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🏥</div>
            <h3>Register Your Hospital</h3>
            <p>List your hospital, manage doctors, beds, blood bank, and service availability in real time</p>
          </div>

          <div className="feature-card" onClick={() => navigate('/register/ambulance')} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🚑</div>
            <h3>Register Ambulance Service</h3>
            <p>Add your ambulance fleet, manage vehicle availability, and get discovered during emergencies</p>
          </div>

          <div className="feature-card" onClick={() => setIsSignInOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="feature-icon">🔑</div>
            <h3>Manage Your Account</h3>
            <p>Sign in to update your profile, services, and availability from your personal dashboard</p>
          </div>
        </section>

        {/* Network stats */}
        <section className="network-stats" aria-labelledby="service-stats-title">
          <div className="network-stats-heading">
            <p className="section-kicker">Our growing network</p>
            <h2 id="service-stats-title">Healthcare providers already on EmerCare</h2>
          </div>
          <div className="network-stats-grid">
            <div className="network-stat-card">
              <span className="network-stat-icon">🏥</span>
              <strong>{statsLoading ? '—' : stats.hospitals}</strong>
              <span>Registered Hospitals</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">🚑</span>
              <strong>{statsLoading ? '—' : stats.ambulances}</strong>
              <span>Ambulance Services</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">🚐</span>
              <strong>{statsLoading ? '—' : stats.vehicles}</strong>
              <span>Registered Vehicles</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">🌐</span>
              <strong>
                {statsLoading ? '—' : stats.hospitals + stats.ambulances}
              </strong>
              <span>Total Active Providers</span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="network-stats" style={{ background: 'transparent' }}>
          <div className="network-stats-heading">
            <p className="section-kicker">Simple process</p>
            <h2>How it works</h2>
          </div>
          <div className="network-stats-grid">
            <div className="network-stat-card">
              <span className="network-stat-icon">📋</span>
              <strong style={{ fontSize: '1.1rem' }}>1. Register</strong>
              <span>Create your hospital or ambulance account with your license and contact details</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">⚙️</span>
              <strong style={{ fontSize: '1.1rem' }}>2. Set Up Profile</strong>
              <span>Add doctors, services, bed count, blood bank stock, or your ambulance fleet</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">📡</span>
              <strong style={{ fontSize: '1.1rem' }}>3. Go Live</strong>
              <span>People in your area can now find and contact your service in emergencies</span>
            </div>
            <div className="network-stat-card">
              <span className="network-stat-icon">🔄</span>
              <strong style={{ fontSize: '1.1rem' }}>4. Stay Current</strong>
              <span>Keep availability, staff, and vehicle info up to date so people always see accurate data</span>
            </div>
          </div>
        </section>

      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-brand">
            <h2>EmerCare</h2>
            <p>Connecting healthcare providers with people in emergency situations.</p>
          </div>

          <nav className="footer-column" aria-label="Register">
            <h3>Get Started</h3>
            <button type="button" onClick={() => navigate('/register/hospital')}>Register Hospital</button>
            <button type="button" onClick={() => navigate('/register/ambulance')}>Register Ambulance</button>
            <button type="button" onClick={() => setIsSignInOpen(true)}>Sign In</button>
          </nav>

          <div className="footer-column footer-note">
            <h3>Emergency support</h3>
            <p>For urgent situations, contact your local emergency services first.</p>
            <p>EmerCare helps providers connect with people in need.</p>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <p>Created by wmba</p>
          <p>© 2026 EmerCare. All rights reserved.</p>
        </div>
      </footer>

      <SignIn isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </div>
  );
}
