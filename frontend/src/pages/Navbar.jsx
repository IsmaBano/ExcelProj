import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css'; // Ensure this is correctly imported
import '../styles/font.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="left-group">
          {/* <img src='' alt="Logo" className="logo-image" /> */}
        </div>

        <div className="center-title">
          EXCEL ANALYTICS PLATFORM
        </div>

        <div className="links">
          <Link to="/register">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
