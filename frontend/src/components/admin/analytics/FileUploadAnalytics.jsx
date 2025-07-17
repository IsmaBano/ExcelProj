import React, { useState } from 'react';
import {BACKEND_URL} from '../../../api/api'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { UserCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import './fileUploadAnalytics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2'];

const FILE_TYPE_COLORS = {
  '.xlsx': '#0088FE', // Blue
  '.xls': '#00C49F',  // Green
  default: '#FFBB28'
};

const FileUploadAnalytics = ({ data }) => {
  const totalUploads = data?.uploadTrends?.reduce((sum, item) => sum + item.count, 0) || 0;
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserClick = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  return (
    <div className="analytics-section">
      <h2>📁 File Upload Analytics</h2>

      {/* Summary Card */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Files Uploaded</h3>
          <p>{totalUploads}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-row">
        {/* Top Uploaders */}
        <div className="chart-box">
          <h4>Top Uploaders</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topUploaders || []}>
              <XAxis dataKey="username" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {(data.topUploaders || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upload Trends */}
        <div className="chart-box">
          <h4>Upload Trends</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.uploadTrends || []}>
              <XAxis
                dataKey="_id"
                tickFormatter={(date) => format(parseISO(date), 'MMM d')}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* File Types */}
        <div className="chart-box">
          <h4>File Types</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.fileTypes || []}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                label
              >
                {(data.fileTypes || []).map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      FILE_TYPE_COLORS[entry._id] || FILE_TYPE_COLORS.default
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="file-type-legend">
            <span><span className="dot" style={{ backgroundColor: '#ffbb28' }}></span> .xlsx</span>
            <span><span className="dot" style={{ backgroundColor: '#00C49F' }}></span> .xls</span>
          </div>
        </div>
      </div>

      {/* Individual User Upload Activity */}
      {data.userUploadDetails && (
        <div className="user-upload-activity">
          <h4>🧑‍💻 Individual User Upload Activity</h4>
          {data.userUploadDetails.length === 0 ? (
            <p>No upload activity yet.</p>
          ) : (
            <div className="user-card-container">
              {data.userUploadDetails.map((user, index) => (
                <div className="user-card" key={index} onClick={() => handleUserClick(user)}>
                  {user.profileImage && user.profileImage.trim() !== '' ? (
                    <img
                      src={`${BACKEND_URL}+${user.profileImage}`}
                      alt={user.username}
                      className="avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/image/avatar.png';
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <UserCircle size={20} color="#aaa" />
                    </div>
                  )}
                  <h5>{user.username}</h5>
                  <p>{user.count} uploads</p>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {selectedUser && (
            <div className="user-modal-overlay" onClick={closeModal}>
              <div className="user-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{selectedUser.username}'s Uploaded Files</h3>
                </div>
                <div className="modal-content">
                  {selectedUser.files.length === 0 ? (
                    <p className="no-files">No files uploaded</p>
                  ) : (
                    <ul className="file-list">
                      {selectedUser.files.map((file, i) => (
                        <li key={i}>{file}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="modal-footer">
                  <button className="close-button" onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadAnalytics;
