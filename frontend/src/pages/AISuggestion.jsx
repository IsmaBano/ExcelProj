import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/aisuggestions.css';
import { BACKEND_URL } from '../api/api';


const AISuggestion = ({ show3DView, onInsertSuggestion }) => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log(BACKEND_URL);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('User not authenticated');
          return;
        }

        // 1. Fetch record
        const recordRes = await axios.get(`${BACKEND_URL}/api/records/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const recordData = recordRes.data;
        setRecord(recordData);

        // 2. Log 'analyze' activity
        await axios.post(
          `${BACKEND_URL}/api/activity/analyze/${id}`,
          { filename: recordData.filename },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 3. Get AI chart suggestions
        const aiRes = await axios.post(
          `${BACKEND_URL}/api/ai/suggest/${id}`,
          { viewMode: show3DView ? '3D' : '2D' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (aiRes.data.success && Array.isArray(aiRes.data.suggestions)) {
          setSuggestions(aiRes.data.suggestions);
        } else {
          toast.error('AI failed to generate chart suggestions');
        }
      } catch (err) {
        console.error('❌ AI Suggestion Error:', err);
        toast.error('Error loading AI suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, show3DView]);

  return (
    <aside className="suggestions-container">
      <div className="suggestions-header">
        <h3>📊 AI Suggestions</h3>
        <p className="file-name">{record?.filename || 'Unknown file'}</p>
      </div>

      {loading ? (
        <div className="loading-message">Loading AI suggestions...</div>
      ) : record ? (
        suggestions.length > 0 ? (
          <ul className="suggestions-list">
            {suggestions.map((sug, index) => (
              <li key={index} className="suggestion-card">
                <div className="suggestion-title">
                  <span className="chart-type">{sug.chartType?.toUpperCase()}</span>
                  <span className="badge">Chart #{index + 1}</span>
                </div>
                <p><strong>X:</strong> {sug.xColumn}</p>
                <p><strong>Y:</strong> {sug.yColumn}</p>
                {show3DView && sug.zColumn && (
                  <p><strong>Z:</strong> {sug.zColumn}</p>
                )}
                <p className="reason"><em>{sug.reason}</em></p>

                {/* 📥 Insert Chart Button */}
                <button
                  className="insert-suggestion-btn"
                  onClick={() => onInsertSuggestion?.({
                    chartType: sug.chartType,
                    xColumn: sug.xColumn,
                    yColumn: sug.yColumn,
                    zColumn: sug.zColumn,
                  })}
                >
                  📥 Insert Suggested Chart
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="error-message">No chart suggestions generated.</div>
        )
      ) : (
        <div className="error-message">No record found.</div>
      )}
    </aside>
  );
};

export default AISuggestion;
