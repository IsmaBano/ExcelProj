import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/login';
import Home from './pages/Home';
import Register from './pages/register';

import DashboardLayout from './components/DashboardLayout';
import AdminDashboardLayout from './components/AdminDashboardLayout';

import Dashboard from './pages/dashboard';
import Upload from './pages/upload';
import ActivityLog from './pages/ActivityLog';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import AISuggestion from './pages/AISuggestion';
import RecentCharts from './pages/recentCharts';

import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import UsageAnalytics from './pages/UsageAnalytics';
import ManageRecords from './pages/ManageRecords';

import BlockedPage from './pages/BlockedPage';
import axios from 'axios';
import { useEffect } from 'react';
import { BACKEND_URL } from './api/api';

function AppRoutes() {
  const { user, isBlocked, blockChecked, logout } = useAuth();

  // ✅ Ping user presence every 5 seconds
  useEffect(() => {
    const pingInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token) return;

      axios
        .patch(`${BACKEND_URL}+/api/user/ping`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((err) => {
          console.error('Ping failed:', err);
        });
    }, 5000);

    return () => clearInterval(pingInterval);
  }, []);

  // ✅ Auto logout if user is blocked
  useEffect(() => {
    if (user && isBlocked) {
      const timeout = setTimeout(() => {
        logout(); // Auto logout after 5 seconds
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [user, isBlocked, logout]);

  // ✅ Wait until block status check completes
  if (user && !blockChecked) {
    return <div className="loading-screen">Checking user status...</div>;
  }

  // ✅ Blocked user view
  if (user && isBlocked) {
    return <BlockedPage />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<UsageAnalytics />} />
        <Route path="records" element={<ManageRecords />} />
      </Route>

      {/* User dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="recentCharts" element={<RecentCharts />} />
        <Route path="profile" element={<Profile />} />
        <Route path="analytics/:id" element={<Analytics />} />
        <Route path="suggestions/:recordId" element={<AISuggestion />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
