import React, { useState } from 'react';
import SignIn from './SignIn';
import '../styles/Navbar.css';

export default function Navbar() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">Welcome To EmerCare</h1>
          
          <div className="navbar-actions">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search hospitals, services..." 
                className="search-input"
              />
            </div>
            
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
