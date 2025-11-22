import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import { getHospitalServicesProfile } from '../services/api';
import '../styles/HospitalServicesDetail.css';

export default function HospitalServicesDetail() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hospitalName, setHospitalName] = useState('');
  const [profile, setProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [beds, setBeds] = useState([]);
  const [bloodBank, setBloodBank] = useState([]);

  useEffect(() => {
    // Get hospital name from localStorage if navigating from HospitalList
    const hospitals = JSON.parse(localStorage.getItem('hospitals') || '[]');
    const hospital = hospitals.find(h => h._id === hospitalId);
    if (hospital) {
      setHospitalName(hospital.hospitalName);
    }
    
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitalId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getHospitalServicesProfile(hospitalId);
      const data = response.data || {};
      setProfile(data);
      setDoctors(data.doctors || []);
      setServices(data.services || []);
      setBeds(data.beds || []);
      setBloodBank(data.bloodBank || []);
    } catch (error) {
      console.error('Error fetching hospital services:', error);
      alert(error.message || 'Failed to load hospital services');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hospital-services-detail-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading hospital services...</p>
        </div>
      </div>
    );
  }

  const totalBeds = beds.reduce((sum, bed) => sum + (bed.total || 0), 0);
  const availableBeds = beds.reduce((sum, bed) => sum + (bed.available || 0), 0);
  const totalBloodUnits = bloodBank.reduce((sum, item) => sum + (item.units || 0), 0);
  const availableBloodGroups = bloodBank.filter(item => item.units > 0).length;

  return (
    <div className="hospital-services-detail-page">
      <Navbar />
      <BackButton />

      <main className="services-detail-content">
        <div className="services-detail-header">
          <h1>{hospitalName || 'Hospital'} Services</h1>
          <p className="subtitle">Complete facility information and availability</p>
        </div>

        <div className="stats-overview">
          <div className="stat-item">
            <div className="stat-icon">👩‍⚕️</div>
            <div className="stat-value">{doctors.length}</div>
            <div className="stat-label">Doctors</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🧪</div>
            <div className="stat-value">{services.length}</div>
            <div className="stat-label">Services</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🛏️</div>
            <div className="stat-value">{availableBeds}/{totalBeds}</div>
            <div className="stat-label">Beds Available</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🩸</div>
            <div className="stat-value">{totalBloodUnits}</div>
            <div className="stat-label">Blood Units</div>
          </div>
        </div>

        {doctors.length > 0 && (
          <section className="detail-section">
            <h2>👩‍⚕️ Our Doctors</h2>
            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <div key={doctor._id} className="doctor-detail-card">
                  <h3>{doctor.name}</h3>
                  <p className="specialty">{doctor.specialty}</p>
                  {doctor.phone && <p>📞 {doctor.phone}</p>}
                  {doctor.email && <p>✉️ {doctor.email}</p>}
                  <span className="availability-badge">{doctor.availability || 'Available'}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {services.length > 0 && (
          <section className="detail-section">
            <h2>🧪 Tests & Treatments</h2>
            <div className="services-grid">
              {services.map((service) => (
                <div key={service._id} className="service-detail-card">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span className={`service-badge ${service.type === 'Test' ? 'badge-blue' : 'badge-green'}`}>
                      {service.type}
                    </span>
                  </div>
                  {service.description && <p>{service.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {beds.length > 0 && (
          <section className="detail-section">
            <h2>🛏️ Bed Availability</h2>
            <div className="beds-grid">
              {beds.map((bed, index) => (
                <div key={bed._id || index} className="bed-detail-card">
                  <h3>{bed.name}</h3>
                  <div className="bed-stats">
                    <div className="bed-stat">
                      <span className="bed-number">{bed.available || 0}</span>
                      <span className="bed-label">Available</span>
                    </div>
                    <div className="bed-divider">/</div>
                    <div className="bed-stat">
                      <span className="bed-number">{bed.total || 0}</span>
                      <span className="bed-label">Total</span>
                    </div>
                  </div>
                  <div className="bed-progress">
                    <div 
                      className="bed-progress-bar" 
                      style={{ 
                        width: `${bed.total > 0 ? (bed.available / bed.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {bloodBank.length > 0 && (
          <section className="detail-section">
            <h2>🩸 Blood Bank Availability</h2>
            <div className="blood-grid">
              {bloodBank.map((item) => (
                <div 
                  key={item._id || item.bloodGroup} 
                  className={`blood-detail-card ${item.units > 0 ? 'available' : 'unavailable'}`}
                >
                  <div className="blood-group">{item.bloodGroup}</div>
                  <div className="blood-units">{item.units || 0}</div>
                  <div className="blood-label">units</div>
                  {item.units > 0 ? (
                    <span className="status-badge available-badge">Available</span>
                  ) : (
                    <span className="status-badge unavailable-badge">Not Available</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {doctors.length === 0 && services.length === 0 && beds.length === 0 && bloodBank.length === 0 && (
          <div className="empty-services">
            <span className="empty-icon">🏥</span>
            <h3>No Services Information Available</h3>
            <p>This hospital hasn't added their services yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
