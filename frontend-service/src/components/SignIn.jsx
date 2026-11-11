import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import '../styles/SignIn.css';

export default function SignIn({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      localStorage.setItem('user', JSON.stringify(response.data));
      const userType = response.data.userType;
      if (userType === 'hospital') navigate('/hospital-profile');
      else if (userType === 'ambulance') navigate('/ambulance-profile');
      onClose();
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="signin-overlay" onClick={onClose}>
      <div className="signin-modal" onClick={(e) => e.stopPropagation()}>
        <button className="signin-close" onClick={onClose}>×</button>

        <div className="signin-header">
          <h2>Service Sign In</h2>
          <p>Access your hospital or ambulance account</p>
        </div>

        <form onSubmit={handleSubmit} className="signin-form">
          {errors.general && <div className="error-banner">{errors.general}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              autoFocus disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button type="submit" className="signin-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="signin-footer">
            <p>New to EmerCare? Register as a <a href="/register/hospital" onClick={(e) => { e.preventDefault(); onClose(); navigate('/register/hospital'); }}>Hospital</a> or <a href="/register/ambulance" onClick={(e) => { e.preventDefault(); onClose(); navigate('/register/ambulance'); }}>Ambulance Service</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}
