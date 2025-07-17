import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCircle } from 'lucide-react';
import '../styles/userManagement.css';
import { BACKEND_URL } from '../api/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ NEW STATE

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/users`);
      const now = new Date();
      const updatedUsers = res.data.map(user => {
        const lastSeen = new Date(user.lastSeen);
        const isOnline = (now - lastSeen) <= 20000;
        return { ...user, isOnline };
      });
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/user/delete/${selectedUserId}`);
      setUsers(prev => prev.filter(user => user._id !== selectedUserId));
      setShowModal(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/user/block/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Block/Unblock failed:', error);
    }
  };

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setShowModal(true);
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ LIVE FILTERING LOGIC
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="user-management-container">
      <h2 className="heading">User Management</h2>

      {/* ✅ Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-box"
        />
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Profile</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr key={user._id}>
                <td>{idx + 1}</td>
                <td>
                  {user.profileImage ? (
                    <img
                      src={`${BACKEND_URL}${user.profileImage}`}
                      alt={user.username}
                      className="avatar"
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      <UserCircle size={20} color="#aaa" />
                    </div>
                  )}
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${user.isOnline ? 'online' : 'offline'}`}>
                    {user.isOnline ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleToggleBlock(user._id)}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteClick(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="8" className="no-users">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
