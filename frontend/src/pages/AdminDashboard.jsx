import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import moment from 'moment';
import '../styles/adminDashboard.css';
import { BACKEND_URL } from '../api/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUploads: 0,
    mostUsedChart: 'N/A',
    chartData: [],
    onlineStats: {
      online: 0,
      offline: 0
    }
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]); // ✅ New state
  const [viewType, setViewType] = useState('day');

  // ✅ Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  // ✅ Fetch users and filter blocked + active
  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/user/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = res.data;
      const now = Date.now();

      const blocked = users.filter(user => user.isBlocked);
      const active = users.filter(user =>
        !user.isBlocked &&
        user.lastSeen &&
        now - new Date(user.lastSeen).getTime() <= 20 * 1000
      );

      setBlockedUsers(blocked);
      setActiveUsers(active);
    } catch (err) {
      console.error('Failed to fetch user status:', err);
    }
  };

  useEffect(() => {
    const pingInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token) return;

      axios.patch(`${BACKEND_URL}+/api/user/ping`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('Ping failed:', err);
      });
    }, 20000);

    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUserStatus();
    const statsInterval = setInterval(() => {
      fetchStats();
      fetchUserStatus();
    }, 20000);
    return () => clearInterval(statsInterval);
  }, []);

  const groupChartData = (data, type) => {
    const grouped = {};
    data.forEach(item => {
      let key;
      if (type === 'week') {
        key = moment(item.date).startOf('isoWeek').format('YYYY-[W]WW');
      } else if (type === 'month') {
        key = moment(item.date).format('YYYY-MM');
      } else {
        key = moment(item.date).format('YYYY-MM-DD');
      }

      if (!grouped[key]) grouped[key] = { date: key, uploads: 0, analyzed: 0 };
      grouped[key].uploads += item.uploads || 0;
      grouped[key].analyzed += item.analyzed || 0;
    });

    return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const filteredData = groupChartData(stats.chartData, viewType);

  const onlineOfflineData = [
    { name: 'Online', value: stats.onlineStats.online },
    { name: 'Offline', value: stats.onlineStats.offline }
  ];

  const COLORS = ['#4CAF50', '#E57373'];

  return (
    <div className="admin-dashboard">
      <h2 className="admin-dashboard-title">Admin Dashboard</h2>

      {/* Top Cards */}
      <div className="admin-cards">
        <div className="admin-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="admin-card">
          <h3>Total Uploads</h3>
          <p>{stats.totalUploads}</p>
        </div>
        <div className="admin-card">
          <h3>Most Used Chart</h3>
          <p>{stats.mostUsedChart}</p>
        </div>
      </div>

      {/* Line Chart */}
      <div className="admin-chart-section full-width">
        <div className="admin-chart-header">
          <h3 className="admin-chart-title"><b>Uploads vs Analyzed Files</b></h3>
          <div className="view-toggle">
            <button className={viewType === 'day' ? 'active' : ''} onClick={() => setViewType('day')}>Day</button>
            <button className={viewType === 'week' ? 'active' : ''} onClick={() => setViewType('week')}>Week</button>
            <button className={viewType === 'month' ? 'active' : ''} onClick={() => setViewType('month')}>Month</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(date) => {
              if (viewType === 'day') return moment(date).format('MMM D');
              if (viewType === 'week') {
                const start = moment(date, 'YYYY-[W]WW').startOf('isoWeek');
                const end = moment(date, 'YYYY-[W]WW').endOf('isoWeek');
                return `${start.format('MMM D')} - ${end.format('MMM D')}`;
              }
              if (viewType === 'month') return moment(date).format('MMMM');
              return date;
            }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="uploads" stroke="#8884d8" strokeWidth={2} dot={{ r: 5 }} name="Uploads" />
            <Line type="monotone" dataKey="analyzed" stroke="#82ca9d" strokeWidth={2} dot={{ r: 5 }} name="Analyzed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie + Users Section */}
      <div className="pie-chart-wrapper">
        {/* Online vs Offline Pie */}
        <div className="admin-chart-section pie-only">
          <div className="admin-chart-header">
            <h3 className="admin-chart-title"><b>Online vs Offline Users</b></h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart width={300} height={300}>
              <Pie
                data={onlineOfflineData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {onlineOfflineData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

{/* Blocked Users */}
<div className="admin-chart-section blocked-users">
  <div className="admin-chart-header">
    <h3 className="admin-chart-title"><b>Blocked Users</b></h3>
  </div>
  <div className="blocked-count-box">
    <div className="blocked-circle blinking-circle">
      <span>{blockedUsers.length}</span>
    </div>
    <p style={{ marginTop: '10px' }}>Users Blocked</p>
  </div>
  <ul className="blocked-user-list">
    {blockedUsers.slice(0, 5).map((user, idx) => (
      <li key={idx}>{user.username || user.email}</li>
    ))}
  </ul>
</div>

{/* Active Users */}
<div className="admin-chart-section active-users">
  <div className="admin-chart-header">
    <h3 className="admin-chart-title"><b>Active Users</b></h3>
  </div>
  <div className="active-count-box">
    <div className="active-circle blinking-circle">
      <span>{activeUsers.length}</span>
    </div>
    <p style={{ marginTop: '10px' }}>Users Online</p>
  </div>
  <ul className="active-user-list">
    {activeUsers.slice(0, 5).map((user, idx) => (
      <li key={idx}>{user.username || user.email}</li>
    ))}
  </ul>
</div>

      </div>
    </div>
  );
};

export default AdminDashboard;
