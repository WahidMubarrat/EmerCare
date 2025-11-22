import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import {
  getHospitalServicesProfile,
  addHospitalDoctor,
  updateHospitalDoctor,
  deleteHospitalDoctor,
  addHospitalService,
  updateHospitalService,
  deleteHospitalService,
  updateHospitalBeds,
  updateHospitalBloodBank
} from '../services/api';
import '../styles/ManageHospitalServices.css';

const BED_PLACEHOLDERS = ['ICU', 'HDU', 'Cabin', 'General Ward'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function ManageHospitalServices() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [beds, setBeds] = useState([]);
  const [bloodBank, setBloodBank] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    availability: 'Available'
  });
  const [serviceForm, setServiceForm] = useState({
    name: '',
    type: 'Test',
    description: ''
  });
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorEditData, setDoctorEditData] = useState({});
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceEditData, setServiceEditData] = useState({});
  const [savingBeds, setSavingBeds] = useState(false);
  const [savingBloodBank, setSavingBloodBank] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.userType !== 'hospital') {
      navigate('/');
      return;
    }

    setUserData(user);
    fetchProfile(user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchProfile = async (hospitalId) => {
    try {
      setLoading(true);
      const response = await getHospitalServicesProfile(hospitalId);
      const data = response.data || {};
      setProfile(data);
      setDoctors(data.doctors || []);
      setServices(data.services || []);
      setBeds((data.beds && data.beds.length > 0) ? data.beds : BED_PLACEHOLDERS.map(name => ({ name, total: 0, available: 0 })));
      setBloodBank((data.bloodBank && data.bloodBank.length > 0) ? data.bloodBank : BLOOD_GROUPS.map(bloodGroup => ({ bloodGroup, units: 0 })));
    } catch (error) {
      console.error('Error fetching hospital services:', error);
      alert(error.message || 'Failed to load hospital services');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorFormChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.name.trim() || !doctorForm.specialty.trim()) {
      alert('Doctor name and specialty are required');
      return;
    }

    try {
      const response = await addHospitalDoctor(userData.id, doctorForm);
      const newDoctor = response.data;
      setDoctors(prev => [newDoctor, ...prev]);
      setDoctorForm({ name: '', specialty: '', phone: '', email: '', availability: 'Available' });
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert(error.message || 'Failed to add doctor');
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctorId(doctor._id);
    setDoctorEditData({
      name: doctor.name,
      specialty: doctor.specialty,
      phone: doctor.phone || '',
      email: doctor.email || '',
      availability: doctor.availability || 'Available'
    });
  };

  const handleDoctorEditChange = (e) => {
    const { name, value } = e.target;
    setDoctorEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateDoctor = async (doctorId) => {
    if (!doctorEditData.name.trim() || !doctorEditData.specialty.trim()) {
      alert('Doctor name and specialty are required');
      return;
    }

    try {
      const response = await updateHospitalDoctor(userData.id, doctorId, doctorEditData);
      const updatedDoctor = response.data;
      setDoctors(prev => prev.map(doc => (doc._id === doctorId ? updatedDoctor : doc)));
      setEditingDoctorId(null);
      setDoctorEditData({});
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert(error.message || 'Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    const confirmDelete = window.confirm('Remove this doctor from the list?');
    if (!confirmDelete) return;

    try {
      await deleteHospitalDoctor(userData.id, doctorId);
      setDoctors(prev => prev.filter(doc => doc._id !== doctorId));
    } catch (error) {
      console.error('Error deleting doctor:', error);
      alert(error.message || 'Failed to delete doctor');
    }
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      alert('Service name is required');
      return;
    }

    try {
      const response = await addHospitalService(userData.id, serviceForm);
      const newService = response.data;
      setServices(prev => [newService, ...prev]);
      setServiceForm({ name: '', type: 'Test', description: '' });
    } catch (error) {
      console.error('Error adding service:', error);
      alert(error.message || 'Failed to add service');
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service._id);
    setServiceEditData({
      name: service.name,
      type: service.type || 'Test',
      description: service.description || ''
    });
  };

  const handleServiceEditChange = (e) => {
    const { name, value } = e.target;
    setServiceEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateService = async (serviceId) => {
    if (!serviceEditData.name.trim()) {
      alert('Service name is required');
      return;
    }

    try {
      const response = await updateHospitalService(userData.id, serviceId, serviceEditData);
      const updatedService = response.data;
      setServices(prev => prev.map(service => (service._id === serviceId ? updatedService : service)));
      setEditingServiceId(null);
      setServiceEditData({});
    } catch (error) {
      console.error('Error updating service:', error);
      alert(error.message || 'Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    const confirmDelete = window.confirm('Remove this service from the list?');
    if (!confirmDelete) return;

    try {
      await deleteHospitalService(userData.id, serviceId);
      setServices(prev => prev.filter(service => service._id !== serviceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(error.message || 'Failed to delete service');
    }
  };

  const handleBedChange = (index, field, value) => {
    setBeds(prev => prev.map((bed, idx) => {
      if (idx !== index) return bed;
      if (field === 'name') {
        return { ...bed, name: value };
      }
      const numericValue = Math.max(0, Number(value ?? 0));
      if (field === 'available') {
        const total = Number(bed.total ?? 0);
        return { ...bed, available: Math.min(numericValue, total) };
      }
      if (field === 'total') {
        const constrainedTotal = numericValue;
        const currentAvailable = Number(bed.available ?? 0);
        return {
          ...bed,
          total: constrainedTotal,
          available: Math.min(currentAvailable, constrainedTotal)
        };
      }
      return { ...bed, [field]: numericValue };
    }));
  };

  const handleAddBedRow = () => {
    setBeds(prev => [...prev, { name: '', total: 0, available: 0 }]);
  };

  const handleRemoveBedRow = (index) => {
    setBeds(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveBeds = async () => {
    const trimmedBeds = beds.map(bed => ({
      ...bed,
      name: (bed.name || '').trim()
    }));

    const hasInvalidName = trimmedBeds.some(bed => !bed.name);
    if (hasInvalidName) {
      alert('Please provide a name for each bed category');
      return;
    }

    try {
      setSavingBeds(true);
      const payload = trimmedBeds.map(bed => ({
        _id: bed._id,
        name: bed.name,
        total: Number(bed.total ?? 0),
        available: Number(bed.available ?? 0)
      }));
      const response = await updateHospitalBeds(userData.id, payload);
      setBeds(response.data || []);
    } catch (error) {
      console.error('Error updating beds:', error);
      alert(error.message || 'Failed to update bed capacities');
    } finally {
      setSavingBeds(false);
    }
  };

  const handleBloodBankChange = (index, value) => {
    setBloodBank(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const numericValue = Math.max(0, Number(value ?? 0));
      return { ...item, units: numericValue };
    }));
  };

  const handleSaveBloodBank = async () => {
    try {
      setSavingBloodBank(true);
      const payload = bloodBank.map(item => ({
        _id: item._id,
        bloodGroup: item.bloodGroup,
        units: Number(item.units ?? 0)
      }));
      const response = await updateHospitalBloodBank(userData.id, payload);
      setBloodBank(response.data || []);
      alert('Blood bank updated successfully!');
    } catch (error) {
      console.error('Error updating blood bank:', error);
      alert(error.message || 'Failed to update blood bank');
    } finally {
      setSavingBloodBank(false);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="manage-hospital-services-page">
      <Navbar />
      <BackButton />

      <main className="services-content">
        <div className="services-header">
          <div className="header-text">
            <h1>🛠️ Manage Hospital Services</h1>
            <p className="subtitle">Maintain your doctors, treatments, and bed availability</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading hospital services...</p>
          </div>
        ) : (
          <>
            <section className="services-section">
              <div className="section-header">
                <h2>👩‍⚕️ Doctors</h2>
              </div>

              <form className="inline-form" onSubmit={handleAddDoctor}>
                <div className="form-grid">
                  <input
                    type="text"
                    name="name"
                    value={doctorForm.name}
                    onChange={handleDoctorFormChange}
                    placeholder="Doctor name"
                  />
                  <input
                    type="text"
                    name="specialty"
                    value={doctorForm.specialty}
                    onChange={handleDoctorFormChange}
                    placeholder="Specialty"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={doctorForm.phone}
                    onChange={handleDoctorFormChange}
                    placeholder="Phone (optional)"
                  />
                  <input
                    type="email"
                    name="email"
                    value={doctorForm.email}
                    onChange={handleDoctorFormChange}
                    placeholder="Email (optional)"
                  />
                  <input
                    type="text"
                    name="availability"
                    value={doctorForm.availability}
                    onChange={handleDoctorFormChange}
                    placeholder="Availability"
                  />
                </div>
                <button type="submit" className="btn-primary">+ Add Doctor</button>
              </form>

              {doctors.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">👩‍⚕️</span>
                  <p>No doctors listed yet.</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {doctors.map((doctor) => (
                    <div key={doctor._id} className="info-card">
                      {editingDoctorId === doctor._id ? (
                        <div className="card-body">
                          <input
                            type="text"
                            name="name"
                            value={doctorEditData.name || ''}
                            onChange={handleDoctorEditChange}
                            placeholder="Doctor name"
                          />
                          <input
                            type="text"
                            name="specialty"
                            value={doctorEditData.specialty || ''}
                            onChange={handleDoctorEditChange}
                            placeholder="Specialty"
                          />
                          <input
                            type="text"
                            name="phone"
                            value={doctorEditData.phone || ''}
                            onChange={handleDoctorEditChange}
                            placeholder="Phone"
                          />
                          <input
                            type="email"
                            name="email"
                            value={doctorEditData.email || ''}
                            onChange={handleDoctorEditChange}
                            placeholder="Email"
                          />
                          <input
                            type="text"
                            name="availability"
                            value={doctorEditData.availability || ''}
                            onChange={handleDoctorEditChange}
                            placeholder="Availability"
                          />
                          <div className="card-actions">
                            <button type="button" className="btn-secondary" onClick={() => handleUpdateDoctor(doctor._id)}>Save</button>
                            <button
                              type="button"
                              className="btn-tertiary"
                              onClick={() => {
                                setEditingDoctorId(null);
                                setDoctorEditData({});
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="card-body">
                          <h3>{doctor.name}</h3>
                          <p className="muted">{doctor.specialty}</p>
                          {doctor.phone && <p>📞 {doctor.phone}</p>}
                          {doctor.email && <p>✉️ {doctor.email}</p>}
                          {doctor.availability && <p>🕒 {doctor.availability}</p>}
                          <div className="card-actions">
                            <button type="button" className="btn-secondary" onClick={() => handleEditDoctor(doctor)}>Edit</button>
                            <button type="button" className="btn-danger" onClick={() => handleDeleteDoctor(doctor._id)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="services-section">
              <div className="section-header">
                <h2>🧪 Tests & Treatments</h2>
              </div>

              <form className="inline-form" onSubmit={handleAddService}>
                <div className="form-grid">
                  <input
                    type="text"
                    name="name"
                    value={serviceForm.name}
                    onChange={handleServiceFormChange}
                    placeholder="Name of test or treatment"
                  />
                  <select
                    name="type"
                    value={serviceForm.type}
                    onChange={handleServiceFormChange}
                  >
                    <option value="Test">Test</option>
                    <option value="Treatment">Treatment</option>
                  </select>
                  <input
                    type="text"
                    name="description"
                    value={serviceForm.description}
                    onChange={handleServiceFormChange}
                    placeholder="Short description (optional)"
                  />
                </div>
                <button type="submit" className="btn-primary">+ Add Service</button>
              </form>

              {services.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🧪</span>
                  <p>No services listed yet.</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {services.map((service) => (
                    <div key={service._id} className="info-card">
                      {editingServiceId === service._id ? (
                        <div className="card-body">
                          <input
                            type="text"
                            name="name"
                            value={serviceEditData.name || ''}
                            onChange={handleServiceEditChange}
                            placeholder="Service name"
                          />
                          <select
                            name="type"
                            value={serviceEditData.type || 'Test'}
                            onChange={handleServiceEditChange}
                          >
                            <option value="Test">Test</option>
                            <option value="Treatment">Treatment</option>
                          </select>
                          <textarea
                            name="description"
                            value={serviceEditData.description || ''}
                            onChange={handleServiceEditChange}
                            placeholder="Description"
                          />
                          <div className="card-actions">
                            <button type="button" className="btn-secondary" onClick={() => handleUpdateService(service._id)}>Save</button>
                            <button
                              type="button"
                              className="btn-tertiary"
                              onClick={() => {
                                setEditingServiceId(null);
                                setServiceEditData({});
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="card-body">
                          <div className="card-header">
                            <h3>{service.name}</h3>
                            <span className={`tag ${service.type === 'Test' ? 'tag-blue' : 'tag-orange'}`}>{service.type}</span>
                          </div>
                          {service.description && <p>{service.description}</p>}
                          <div className="card-actions">
                            <button type="button" className="btn-secondary" onClick={() => handleEditService(service)}>Edit</button>
                            <button type="button" className="btn-danger" onClick={() => handleDeleteService(service._id)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="services-section">
              <div className="section-header">
                <h2>🛏️ Bed Capacity</h2>
              </div>

              <div className="beds-table">
                <div className="beds-header">
                  <span>Category</span>
                  <span>Total Beds</span>
                  <span>Available Beds</span>
                  <span>Actions</span>
                </div>
                {beds.map((bed, index) => (
                  <div key={bed._id || `${bed.name}-${index}`} className="beds-row">
                    <input
                      type="text"
                      value={bed.name}
                      onChange={(e) => handleBedChange(index, 'name', e.target.value)}
                      placeholder={BED_PLACEHOLDERS[index] || 'Ward name'}
                    />
                    <input
                      type="number"
                      min="0"
                      value={bed.total}
                      onChange={(e) => handleBedChange(index, 'total', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      value={bed.available}
                      onChange={(e) => handleBedChange(index, 'available', e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-tertiary"
                      onClick={() => handleRemoveBedRow(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="beds-actions">
                <button type="button" className="btn-secondary" onClick={handleAddBedRow}>+ Add Bed Category</button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveBeds}
                  disabled={savingBeds}
                >
                  {savingBeds ? 'Saving...' : 'Save Bed Capacity'}
                </button>
              </div>
            </section>

            <section className="services-section">
              <div className="section-header">
                <h2>🩸 Blood Bank</h2>
              </div>

              <div className="blood-bank-grid">
                {bloodBank.map((item, index) => (
                  <div key={item._id || item.bloodGroup} className="blood-card">
                    <div className="blood-group-label">{item.bloodGroup}</div>
                    <input
                      type="number"
                      min="0"
                      value={item.units}
                      onChange={(e) => handleBloodBankChange(index, e.target.value)}
                      placeholder="Units available"
                      className="blood-input"
                    />
                    <div className="blood-unit-label">units</div>
                  </div>
                ))}
              </div>

              <div className="beds-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveBloodBank}
                  disabled={savingBloodBank}
                >
                  {savingBloodBank ? 'Saving...' : 'Save Blood Bank'}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
