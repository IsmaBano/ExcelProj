import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/DashboardLayout.css';
import {
  LogOut,
  LayoutDashboard,
  UploadCloud,
  Activity,
  User,
  Clock,
  Menu,
} from 'lucide-react';
import { BACKEND_URL } from '../api/api';


const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const res = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
        localStorage.setItem('username', res.data.user.username);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="dashboardlayout-container">
      {/* Decorative Animations */}
      <div
        className="background-decorations"
        key={`background-${location.pathname}`}
      >
        <div className="top-right-decoration" />
        <div className="bottom-right-decoration" />
      </div>

      {/* Top Header */}
      <header className="dashboardlayout-header slide-down">
        <div className="header-left">
          {/* <img
            src=""
            alt="Logo"
            className="dashboardlayout-logo"
          /> */}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
        <div className="header-center">Excel Analytics Platform</div>
        <div className="header-right">
          <span className="header-username">
            {user?.username || localStorage.getItem('username') || 'User'}
          </span>
          <img
            src={
              user?.profileImage
                ? `${BACKEND_URL}${user.profileImage}`
                : '/images/avatar.png'
            }
            alt="Profile"
            className="dashboardlayout-profile-pic"
            onClick={() => navigate('/dashboard/profile')}
          />
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="dashboardlayout-body ">
        {/* Sidebar */}
        <aside  className={`dashboardlayout-sidebar slide-left ${isSidebarOpen ? 'visible' : ''}`}>
          <button onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={18} style={{ marginRight: '8px' }} />
            Dashboard
          </button>
          <button onClick={() => navigate('/dashboard/upload')}>
            <UploadCloud size={18} style={{ marginRight: '8px' }} />
            Upload File
          </button>
          <button onClick={() => navigate('/dashboard/activity')}>
            <Activity size={18} style={{ marginRight: '8px' }} />
            Activity Log
          </button>
          <button onClick={() => navigate('/dashboard/recentCharts')}>
            <Clock size={18} style={{ marginRight: '8px' }} />
            Recent Charts
          </button>
          <button onClick={() => navigate('/dashboard/profile')}>
            <User size={18} style={{ marginRight: '8px' }} />
            Profile
          </button>
          <button
            className="logout-button"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Logout
          </button>
        </aside>

        {/* 👇 This renders nested routes like /dashboard/recentCharts */}
        <main className="dashboardlayout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
