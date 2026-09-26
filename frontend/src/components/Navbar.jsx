import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignIn from './SignIn';
import { getAllHospitals } from '../services/api';
import '../styles/Navbar.css';

export default function Navbar() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hospitalsCache, setHospitalsCache] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const loadHospitals = async () => {
    if (hospitalsCache.length > 0) return hospitalsCache;
    try {
      const response = await getAllHospitals();
      const data = response.data || [];
      setHospitalsCache(data);
      return data;
    } catch (err) {
      console.error('Failed to load hospitals for search:', err);
      return [];
    }
  };

  const handleQueryChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    const term = value.trim();
    if (!term) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const hospitals = await loadHospitals();
    const matches = hospitals
      .filter((h) =>
        `${h.hospitalName} ${h.city || ''} ${h.postcode || ''}`
          .toLowerCase()
          .includes(term.toLowerCase())
      )
      .slice(0, 6);

    setSuggestions(matches);
    setShowDropdown(true);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setQuery('');
    closeDropdown();
    navigate(`/hospitals?q=${encodeURIComponent(term)}`);
  };

  const handleSelect = (hospital) => {
    setQuery('');
    closeDropdown();
    navigate(`/hospitals?q=${encodeURIComponent(hospital.hospitalName)}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeDropdown();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Welcome To EmerCare</h1>

          <div className="navbar-actions">
            <form className="search-box" ref={searchRef} onSubmit={handleSubmit}>
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search hospitals..."
                className="search-input"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => {
                  if (query.trim()) setShowDropdown(true);
                }}
                aria-label="Search hospitals"
                autoComplete="off"
              />

              {showDropdown && (
                <div className="search-dropdown">
                  {suggestions.length === 0 ? (
                    <div className="search-dropdown-empty">No hospitals match "{query.trim()}"</div>
                  ) : (
                    suggestions.map((hospital) => (
                      <button
                        key={hospital._id}
                        type="button"
                        className="search-dropdown-item"
                        onClick={() => handleSelect(hospital)}
                      >
                        <div className="search-dropdown-name">{hospital.hospitalName}</div>
                        <div className="search-dropdown-meta">
                          {[hospital.city, hospital.postcode].filter(Boolean).join(', ') ||
                            'Location not set'}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </form>

            <button className="btn btn-login" onClick={() => setIsSignInOpen(true)}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <SignIn isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
}