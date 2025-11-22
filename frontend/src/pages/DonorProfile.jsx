import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AvailabilityToggle from '../components/AvailabilityToggle';
import PasswordChange from '../components/PasswordChange';
import '../styles/DonorProfile.css';

export default function DonorProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editedData, setEditedData] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.userType !== 'donor') {
      navigate('/');
      return;
    }

    setUserData(user);
    setIsAvailable(user.isActive);
    setEditedData({
      name: user.name,
      phone: user.phone,
      email: user.email,
      age: user.age,
      street: user.street,
      city: user.city,
      postcode: user.postcode
    });
  }, [navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/donors/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...userData, ...editedData };
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData({
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      age: userData.age,
      street: userData.street,
      city: userData.city,
      postcode: userData.postcode
    });
    setIsEditing(false);
  };

  const handleAvailabilityToggle = async (newAvailability) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/donors/${userData.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newAvailability }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAvailable(newAvailability);
        
        // Update localStorage
        const updatedUser = { ...userData, isActive: newAvailability };
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert(data.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Update availability error:', error);
      alert('Failed to update availability. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/donors/${userData.id}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    alert('Password changed successfully!');
    return data;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="donor-profile-page">
      <Navbar />
      
      <div className="profile-container-centered">
        <div className="profile-header">
          <div className="profile-icon">🩸</div>
          <h1>Donor Profile</h1>
          <div className="header-actions">
            <AvailabilityToggle 
              isAvailable={isAvailable}
              onToggle={handleAvailabilityToggle}
              disabled={isUpdating}
            />
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="profile-card-main">
          <div className="profile-image-section">
            {userData.picture && (
              <img src={userData.picture} alt={userData.name} className="profile-picture" />
            )}
          </div>

          <div className="profile-info-section">
            <div className="section-header">
              <h2>Personal Information</h2>
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
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editedData.name}
                    onChange={handleEditChange}
                    className="edit-input"
                  />
                ) : (
                  <p>{userData.name}</p>
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

              <div className="info-item">
                <label>Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={editedData.age}
                    onChange={handleEditChange}
                    className="edit-input"
                    min="18"
                    max="65"
                  />
                ) : (
                  <p>{userData.age} years</p>
                )}
              </div>

              <div className="info-item blood-group-highlight">
                <label>Blood Group</label>
                <p className="blood-group">{userData.bloodGroup}</p>
              </div>

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
          </div>

          <div className="donation-info">
            <h3>Thank you for being a blood donor! 🩸</h3>
            <p>Your generosity can save lives. Make sure to stay healthy and donate regularly.</p>
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
        userType="donor"
        userId={userData?.id}
      />
    </div>
  );
}
