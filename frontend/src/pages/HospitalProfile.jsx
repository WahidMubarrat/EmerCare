import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PasswordChange from '../components/PasswordChange';
import '../styles/HospitalProfile.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function HospitalProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    // Get user data from localStorage
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
    setEditedData({
      hospitalName: user.hospitalName,
      phone: user.phone,
      email: user.email,
      street: user.street,
      city: user.city,
      postcode: user.postcode
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`${API_BASE_URL}/hospitals/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update local storage and state
      const updatedUser = {
        ...userData,
        ...editedData
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData({
      hospitalName: userData.hospitalName,
      phone: userData.phone,
      email: userData.email,
      street: userData.street,
      city: userData.city,
      postcode: userData.postcode
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${userData.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      alert('Password changed successfully!');
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="hospital-profile-page">
      <Navbar />
      
      <div className="profile-container-centered">
        <div className="profile-header">
          <div className="profile-icon">🏥</div>
          <h1>Hospital Profile</h1>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        <div className="profile-card-main">
          <div className="section-header">
            <h2>Hospital Information</h2>
            {!isEditing ? (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel" onClick={handleCancelEdit}>Cancel</button>
                <button className="btn-save" onClick={handleSaveProfile} disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Hospital Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="hospitalName"
                  value={editedData.hospitalName}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{userData.hospitalName}</p>
              )}
            </div>

            <div className="info-item">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedData.email}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{userData.email}</p>
              )}
            </div>

              <div className="info-item">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editedData.phone}
                    onChange={handleEditChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{userData.phone}</p>
                )}
              </div>
            </div>          <div className="section-divider"></div>

          <h3>Location</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Street Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="street"
                  value={editedData.street}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{userData.street}</p>
              )}
            </div>

            <div className="info-item">
              <label>City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={editedData.city}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{userData.city}</p>
              )}
            </div>

            <div className="info-item">
              <label>Postcode</label>
              {isEditing ? (
                <input
                  type="text"
                  name="postcode"
                  value={editedData.postcode}
                  onChange={handleEditChange}
                  className="edit-input"
                />
              ) : (
                <p>{userData.postcode}</p>
              )}
            </div>
          </div>

          <div className="section-divider"></div>

          <h3>License Document</h3>
          <div className="license-preview">
            {userData.license && (
              <a href={userData.license} target="_blank" rel="noopener noreferrer" className="view-license-btn">
                View License Document
              </a>
            )}
          </div>

          <div className="manage-services-section">
            <button
              className="btn-manage-services"
              onClick={() => navigate('/manage-hospital-services')}
            >
              🛠️ Manage Services
            </button>
          </div>

          <div className="password-section">
            <button 
              className="btn-change-password" 
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      <PasswordChange
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordChange={handlePasswordChange}
        userType="hospital"
        userId={userData.id}
      />
    </div>
  );
}
