import React from 'react';
import { Link } from 'react-router-dom';      // <-- import Link here
import '../styles/home.css';
import dashboardImg from '../images/logo.png';
import { FaUpload, FaCogs, FaChartBar, FaFileExport } from 'react-icons/fa';
import Navbar from './Navbar';
import '../styles/font.css';

function Home() {
  return (
    <>
   
      <Navbar />
     
      <div className="home-container mt-16">
        <div className="top-section mt-5">
          {/* Left image */}
          <div className="image-frame">
            <img src={dashboardImg} alt="Analytics Dashboard" />
          </div>

          {/* Right text */}
          <div className="text-content ">
            <h1><b>EXCEL ANALYTICS <br /> PLATFORM</b></h1>
            <p>
              A platform to the use of Microsoft Excel, or similar spreadsheet software,
              to analyze and visualize data, often in conjunction with other tools or features.
            </p>

            <div className="button-group">
              {/* Changed buttons to Links */}
              <Link to="/login" className="btn primary">
                Get Started
              </Link>
              <Link to="/register" className="btn secondary">
                Register
              </Link>
            </div>
          </div>
        </div>

        {/* Feature icons below */}
        <div className="feature-section">
          <div className="feature-item">
            <FaUpload />
            <span>SMART UPLOAD</span>
          </div>
          <div className="feature-item">
            <FaCogs />
            <span>CUSTOM FILTER</span>
          </div>
          <div className="feature-item">
            <FaChartBar />
            <span>INTERACTIVE CHART</span>
          </div>
          <div className="feature-item">
            <FaFileExport />
            <span>EXPORT REPORTS</span>
          </div>
        </div>
        {/* Background */}
        <div className="wave-image" />
      </div>
    </>
  );
}

export default Home;
