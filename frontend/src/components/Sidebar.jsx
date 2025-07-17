  import React from 'react';
  import { Link, useNavigate } from 'react-router-dom';
  import '../styles/sidebar.css';

  const Sidebar = () => {
    const navigate = useNavigate();

    const logoutHandler = () => {
      localStorage.removeItem('token');
      navigate('/login');
    };

    return (
      <aside className="sidebar">
        <div className="logo">ZIDIO</div>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/upload">Upload File</Link>
          <Link to="/activity">Activity Log</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={logoutHandler} className="logout-btn">Logout</button>
        </nav>
      </aside>
    );
  };

  export default Sidebar;
