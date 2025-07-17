import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="logo">ANALYSER</div>
        <nav>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/users">User Management</Link>
          <Link to="/admin/analytics">Usage Analytics</Link>
          <Link to="/admin/records">Manage Records</Link>
        </nav>
      </div>
      <button onClick={logoutHandler} className="logout-btn">Logout</button>
    </aside>
  );
};

export default AdminSidebar;
