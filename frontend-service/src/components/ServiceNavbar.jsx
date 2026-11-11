import React, { useState } from 'react';
import SignIn from './SignIn';
import '../styles/Navbar.css';

export default function ServiceNavbar() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <h1 className="navbar-title">EmerCare — Service Portal</h1>
          <div className="navbar-actions">
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
