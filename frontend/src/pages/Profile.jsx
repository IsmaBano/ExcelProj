import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/profile.css';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../api/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setEditName(res.data.user.username || '');
        setProfileImage(null);
        setSelectedFile(null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to fetch profile.');
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setProfileImage(URL.createObjectURL(file));
  };

  const isDirty = () => {
    if (!user) return false;
    return (
      editName.trim() !== (user.username || '').trim() ||
      selectedFile !== null
    );
  };

  const handleProfileUpdate = async () => {
    if (!editName.trim()) {
      toast.error('Username cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (editName !== user.username) {
        await axios.put(
          `${BACKEND_URL}/api/user/profile/username`,
          { username: editName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (selectedFile) {
        const formData = new FormData();
        formData.append('profileImage', selectedFile);

        const imgRes = await axios.put(
          `${BACKEND_URL}/api/user/profile/image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser((prev) => ({
          ...prev,
          username: editName,
          profileImage: imgRes.data.imagePath,
        }));

        setSelectedFile(null);
        setProfileImage(null);
      } else {
        setUser((prev) => ({ ...prev, username: editName }));
      }

      toast.success('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="profile-wrapper">
    <div className="profile-container">
      {/* LEFT SECTION */}
      <div className="profile-left">
        <div className="avatar-container">
<img
  src={
    profileImage ||
    (user?.profileImage
      ? `${BACKEND_URL}+${user.profileImage}`  // ✅ correct backend path
      : '/images/avatar.png')                        // default fallback
  }
  alt="Profile"
  className="profile-avatar"
/>


  {isEditingUsername && (
    <label className="upload-icon-button">
      +
      <input
        type="file"
        name="profileImage"
        accept="image/*"
        onChange={handleImageChange}
        hidden
      />
    </label>
  )}
</div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '10px 0 4px', fontWeight: '600' }}>
            Welcome <span style={{ fontWeight: 'bold',color:'green' }}>{user?.username}</span>
          </p>
          <p style={{ fontSize: '14px', color: '#374151' }}>
            You can also edit your username and profile
          </p>
          <button
            className="edit-profile-btn"
            onClick={() => setIsEditingUsername(true)}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="profile-right">
        <h2 className="profile-title">Profile Page</h2>

        {!isEditingUsername ? (
          <>
            <div className="profile-info-row">
              <span className="info-label">Username</span>
              <span className="info-value">{user?.username}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Role</span>
              <span className="info-value">{user?.role}</span>
            </div>
            <div className="profile-info-row">
              <span className="info-label">Joined</span>
              <span className="info-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : ''}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Username</label>
              <input
                id="username-input"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {isDirty() && (
                <button
                  className="update-button"
                  onClick={async () => {
                    await handleProfileUpdate();
                    setIsEditingUsername(false);
                  }}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              )}

              <button
                className="cancel-button"
                onClick={() => {
                  setEditName(user.username);
                  setSelectedFile(null);
                  setProfileImage(null);
                  setIsEditingUsername(false);
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);

}

export default Profile;
