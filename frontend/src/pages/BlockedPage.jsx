import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BlockedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleBackToLogin = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ color: 'red' }}>🚫 You are Blocked</h1>
      <p>Please contact admin to restore your access.</p>
      <button
        onClick={handleBackToLogin}
        style={{ padding: '10px 20px', marginTop: '20px' }}
      >
        Back to Home
      </button>
    </div>
  );
}

export default BlockedPage; 
