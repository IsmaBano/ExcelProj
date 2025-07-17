import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FileUploadAnalytics from '../components/admin/analytics/FileUploadAnalytics';
import ChartTrackingAnalytics from '../components/admin/analytics/ChartTrackingAnalytics';
import UserEngagementAnalytics from '../components/admin/analytics/UserEngagementAnalytics';
import '../styles/usageAnalytics.css';
import { BACKEND_URL } from '../api/api';

const UsageAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fileUpload');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/admin/usage-analytics`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setAnalyticsData(response.data);
        setError(null);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied. You are not an admin.');
        } else {
          setError('Failed to fetch usage analytics. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="loading-message">Loading Usage Analytics...</p>;
  if (error) return <p className="error-message">{error}</p>;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'fileUpload':
        return <FileUploadAnalytics data={analyticsData.fileUploadStats} />;
      case 'chartTracking':
        return <ChartTrackingAnalytics data={analyticsData.chartTracking} />;
      case 'userEngagement':
        return <UserEngagementAnalytics data={analyticsData.userEngagement} />;
      default:
        return null;
    }
  };

  return (
    <div className="usage-analytics-page">
      <h2>Usage Analytics</h2>

      <div className="tab-buttons">
        <button
          className={activeTab === 'fileUpload' ? 'active' : ''}
          onClick={() => setActiveTab('fileUpload')}
        >
          File Upload Analytics
        </button>
        <button
          className={activeTab === 'chartTracking' ? 'active' : ''}
          onClick={() => setActiveTab('chartTracking')}
        >
          Chart Tracking Analytics
        </button>
        <button
          className={activeTab === 'userEngagement' ? 'active' : ''}
          onClick={() => setActiveTab('userEngagement')}
        >
          User Engagement Analytics
        </button>
      </div>

      <div className="tab-content">{renderActiveTab()}</div>
    </div>
  );
};

export default UsageAnalytics;
