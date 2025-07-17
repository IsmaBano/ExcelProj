import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { UserCircle } from 'lucide-react';
import '../styles/ManageRecords.css';
import { BACKEND_URL } from '../api/api';

const ManageRecords = () => {
  const [files, setFiles] = useState([]);
  const [groupedUsers, setGroupedUsers] = useState({});
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    // only close the modal if delete modal is not active
    if (
      showModal &&
      !showDeleteModal && // prevent interfering when delete modal is open
      modalRef.current &&
      !modalRef.current.contains(event.target)
    ) {
      setShowModal(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showModal, showDeleteModal]);




  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/records/allfiles`);
        setFiles(res.data);
      } catch (error) {
        console.error('Failed to fetch Excel files:', error);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    const grouped = {};
    files.forEach((file) => {
      const uploader = file.uploadedBy;
      if (uploader?._id) {
        if (!grouped[uploader._id]) {
          grouped[uploader._id] = {
            profileImage: uploader.profileImage,
            username: uploader.username || 'Unknown User',
            files: [],
          };
        }
        grouped[uploader._id].files.push(file);
      }
    });
    setGroupedUsers(grouped);
  }, [files]);

  const handleUserCardClick = (userId) => {
    const userData = groupedUsers[userId];
    if (userData) {
      setSelectedUserData({ ...userData, userId });
      setShowModal(true);
    }
  };

  const handleDeleteClick = (fileId) => {
    setSelectedFileId(fileId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/records/allfiles/delete/${selectedFileId}`);
      const updatedFiles = files.filter((file) => file._id !== selectedFileId);
      setFiles(updatedFiles);

      if (selectedUserData) {
        const updatedUserFiles = selectedUserData.files?.filter(file => file._id !== selectedFileId) || [];
        setSelectedUserData({ ...selectedUserData, files: updatedUserFiles });
      }
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setShowDeleteModal(false);
      setSelectedFileId(null);
    }
  };

  const filteredGroupedUsers = Object.entries(groupedUsers).filter(([_, userData]) =>
    userData.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`user-management-container ${showModal || showDeleteModal ? 'blurred' : ''}`}>
      <h2 className="heading">Manage Excel File Uploads</h2>

      <input
        type="text"
        placeholder="Search by username..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-box"
        style={{ marginBottom: '20px' }}
      />

      <div className="user-card-grid">
        {filteredGroupedUsers.map(([userId, userData]) => (
          <div key={userId} className="user-card" onClick={() => handleUserCardClick(userId)}>
            {userData.profileImage ? (
              <img src={`${BACKEND_URL}+${userData.profileImage}`} alt={userData.username} className="user-avatar" />
            ) : (
              <div className="user-avatar placeholder">
                <UserCircle size={32} color="#aaa" />
              </div>
            )}
            <h4>{userData.username}</h4>
            <p>{userData.files.length} file(s)</p>
          </div>
        ))}
        {files.length === 0 && <p className="no-users">No Excel files found.</p>}
      </div>

      {showModal && selectedUserData && (
        <div className="modal-overlay">
          <div className="modal-box" ref={modalRef}>
            <div className="user-info">
              {selectedUserData.profileImage ? (
                <img src={`${BACKEND_URL}+${selectedUserData.profileImage}`} alt="User" className="user-avatar" />
              ) : (
                <div className="user-avatar placeholder">
                  <UserCircle size={40} color="#aaa" />
                </div>
              )}
              <div className="details">
                <h3>{selectedUserData.username}</h3>
                <span className="userid">User ID: {selectedUserData.userId}</span>
              </div>
            </div>

            <div className="file-list">
              {selectedUserData.files?.map((file) => (
                <div key={file._id} className="file-card">
                  <div className="file-info">
                    <h4>{file.filename}</h4>
                    <small>{new Date(file.uploadedAt).toLocaleString()}</small>
                  </div>
                  <div className="file-actions">
                    <button className="btn btn-danger" onClick={() => handleDeleteClick(file._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="confirm-delete-box" ref={deleteModalRef}>
            <div className="icon">🗑️</div>
            <h3>Are you sure you want to delete this file?</h3>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>Yes, Delete</button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRecords;
