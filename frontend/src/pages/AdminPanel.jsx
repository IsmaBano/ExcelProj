import React, { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import '../styles/AdminPanel.css';
// import { useNavigate } from 'react-router-dom';
import AdminUserList from './AdminUserList';
import { BACKEND_URL } from '../api/api';
const AdminPanel = () => {
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
//  const navigate = useNavigate();
  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/storage`); // ✅ CORRECT PORT
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        console.log("📦 Storage data:", data);
        setStorageData(data);
      } catch (err) {
        console.error("❌ Failed to fetch storage data:", err);
        setError('Failed to load storage data');
      } finally {
        setLoading(false);
      }
    };

    fetchStorageData();
  }, []);

  if (loading) return <div>Loading storage info...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!storageData) return <div>No storage data available</div>;

  const { storageSize = 0, totalQuota = 1 } = storageData;
  const usedMB = (storageSize / (1024 * 1024)).toFixed(2);
  const totalMB = (totalQuota / (1024 * 1024)).toFixed(2);
  const percentage = totalQuota > 0 ? Math.min((storageSize / totalQuota) * 100, 100) : 0;

  return (
   <div className='main-panel'>
 <div className='card1'>
   <div className='progress-wrapper'>
      <CircularProgressbar
        value={percentage}
        text={`${percentage.toFixed(1)}%`}
        styles={buildStyles({
          pathColor: '#22c55e',
          textColor: '#000',
          trailColor: '#eee',
        })}
      />
      <div className='storage-info'>
        <strong>{usedMB} MB</strong> / {totalMB} MB used
      </div>
    </div>
 </div>
<div className='card2'>
   <AdminUserList/>
</div>
   </div>
  );
};

export default AdminPanel;
