import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const UserEngagementAnalytics = ({ data }) => {
  return (
    <div className="analytics-section">
      <h2>👤 User Engagement</h2>

      <div className="analytics-row">
        <div className="chart-box">
          <h4>Daily Active Users</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.dailyActiveUsers}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="activeUsers" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h4>User Registrations</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.registrations}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FFBB28" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default UserEngagementAnalytics;
