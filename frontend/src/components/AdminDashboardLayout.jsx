import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Folder,
  LogOut,
  Menu,
} from 'lucide-react';
import '../styles/AdminDashboardLayout.css';
import { BACKEND_URL } from '../api/api';



const AdminDashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const res = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdminUser(res.data.user);
        localStorage.setItem('username', res.data.user.username);
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
        navigate('/login');
      }
    };

    fetchAdmin();
  }, [navigate]);

  return (
    <div className="dashboardlayout-container">
      {/* Decorative Background */}
      <div className="background-decorations" key={`admin-${location.pathname}`}>
        <div className="top-right-decoration" />
        <div className="bottom-right-decoration" />
      </div>

      {/* Header */}
      <header className="dashboardlayout-header slide-down">
        <div className="header-left">
          {/* <img
            src=""
            alt="Admin Logo"
            className="dashboardlayout-logo"
          /> */}
           <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
        <div className="header-center">Admin Panel</div>
<div className="header-right">
  <div className="admin-info">
    <span className="admin-name">
      {adminUser?.username || 'Admin'}
    </span>
    <img
      src={
        adminUser?.profileImage
          ? `${BACKEND_URL}${adminUser.profileImage}`
          : '/images/admin.png'
      }
      alt="Admin Avatar"
      className="dashboardlayout-profile-pic"
    />
  </div>
</div>


      </header>

      {/* Sidebar and Content */}
      <div className="dashboardlayout-body">
       <aside  className={`dashboardlayout-sidebar slide-left ${isSidebarOpen ? 'visible' : ''}`}>
          <button onClick={() => navigate('/admin')}>
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button onClick={() => navigate('/admin/users')}>
            <Users size={18} />
            Manage Users
          </button>
          <button onClick={() => navigate('/admin/analytics')}>
            <BarChart2 size={18} />
            Usage Analytics
          </button>
          <button onClick={() => navigate('/admin/records')}>
            <Folder size={18} />
            Manage Records
          </button>
          <button
            className="logout-button"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </aside>

        <main className="dashboardlayout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
