import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';
import { BACKEND_URL } from '../api/api';

const Dashboard = () => {
  const [uploads, setUploads] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Max uploads goal for circle calculation
  const maxUploadsGoal = 1000;

  // Calculate circle progress percentage (cap at 100%)
  const progressPercent = Math.min((uploads.length / maxUploadsGoal) * 1000, 1000);

  // Circle constants
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 1000) * circumference;

  // Function to determine stroke color based on upload percentage
  function getStrokeColor(percent) {
    if (percent >= 750) return '#ff0000'; // Red
    if (percent >= 500) return '#FF9800'; // Orange
    if (percent >= 250) return '#FFC107'; // Yellow
    return '#4CAF50'; // Green
  }

  const strokeColor = getStrokeColor(progressPercent);

  // Create a fetch function that can be called on mount and after updates
  const fetchDashboardData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const uploadsRes = await axios.get(`${BACKEND_URL}/api/records/myuploads`, config);
      const activityRes = await axios.get(`${BACKEND_URL}/api/activity/recent`, config);
      setUploads(uploadsRes.data);
      setActivityLogs(activityRes.data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    }
  }, [token]);

  // Initial data fetch
  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token, fetchDashboardData]);

  // Function to handle profile photo update (you need to call this on your profile UI)
   const handleProfilePhotoUpdate = async (newPhotoData) => {
    try {
      console.log('🔼 Sending photo update:', newPhotoData.slice(0, 30)); // trimmed preview
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };
      const res = await axios.put(
        `${BACKEND_URL}/api/activity/profile`,
        { photo: newPhotoData },
        config
      );

      if (res.data.success) {
        console.log('✅ Photo updated successfully');
        fetchDashboardData(); // Reload logs and uploads
      } else {
        console.warn('⚠️ Update failed:', res.data);
      }
    } catch (error) {
      console.error('❌ Profile photo update failed:', error);
    }
  };

  // Function to handle Analyze button click - navigate to analytics page with upload id
  const handleAnalyze = (uploadId) => {
    navigate(`/dashboard/analytics/${uploadId}`);
  };


  const [displayCount, setDisplayCount] = useState(0);

// Animate when uploads length changes
useEffect(() => {
  let start = 0;
  const end = uploads.length;
  if (start === end) return;

  const duration = 800; // Total animation time in ms
  const incrementTime = 30; // How often the count updates
  const steps = Math.ceil(duration / incrementTime); // ~27 steps
  const increment = Math.ceil(end / steps); // How much to increase per step


  const timer = setInterval(() => {
    start += increment;
    if (start >= end) {
      setDisplayCount(end);
      clearInterval(timer);
    } else {
      setDisplayCount(start);
    }
  }, incrementTime);

  return () => clearInterval(timer);
}, [uploads.length]);


  return (
    <div className="dashboard-wrapper">
      <div className="top-columns" >
        {/* LEFT COLUMN */}
        <div className="left-column  " >
          <h2 className='text-2xl md:text-3xl font-bold mb-4'>Dashboard</h2>

          <div
            className="total-uploads-section flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-[40px] mb-6"
           
          >
            {/* Total uploads text */}
            <div className="uploads-count" style={{ minWidth: '250px' }}>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Total Uploads</p>
              <h1 style={{ fontSize: '40px', fontWeight: '900', margin: 0 }}>{displayCount}</h1>
            </div>

            {/* Circle outside the total uploads box */}
            <div className="uploads-circle-graph" style={{ width: '120px', height: '120px' }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#ddd"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 1s ease' }}
                />
                <text
                  x="60"
                  y="65"
                  textAnchor="middle"
                  fontSize="22"
                  fill={strokeColor}
                  fontWeight="600"
                >
                  {Math.round(progressPercent)}%
                </text>
              </svg>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Action</h3>
            <div className="buttons-row flex gap-[20px]" >
              <button onClick={() => navigate('/dashboard/upload')}>Upload New File</button>
              <button onClick={() => navigate('/dashboard/activity')}>View Activity Log</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <div className="activity-summary">
            <h3>Activity Summary</h3>
            {activityLogs.length === 0 ? (
              <p>No recent activity.</p>
            ) : (
              <div className="activity-list-scroll">
                <ul>
                  {activityLogs
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 8)
                    .map((log, i) => (
                      <li key={i}>
                        {log.action === 'upload' && `Uploaded ${log.filename}`}
                        {log.action === 'analyze' && `Analyzed ${log.filename}`}
                        {log.action === 'export' && `Exported report of ${log.filename}`}
                        {log.action === 'delete' && `Deleted ${log.filename}`}
                        {log.action === 'update-profile' && 'Changed username'}
                        {log.action === 'update-photo' && 'Updated profile photo'}
                        {!['upload', 'analyze', 'export', 'update-profile', 'update-photo','delete'].includes(log.action) &&
                          `${log.action} performed`}
                        {' '}on {new Date(log.timestamp).toLocaleString()}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div
        className="bottom-panel"
        style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', width: '100%' }}
      >
        <div className="recent-uploads-container" style={{ flex: 1 }}>
          <h3>Recent Uploads</h3>
          <div className="recent-uploads-scroll">
            <div className="recent-uploads">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload) => (
                    <tr key={upload._id}>
                      <td>{upload.filename}</td>
                      <td>{new Date(upload.uploadedAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => handleAnalyze(upload._id)}>Analyze</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
