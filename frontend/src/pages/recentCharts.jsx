import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import '../styles/recentCharts.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BACKEND_URL } from '../api/api';

const TILES_PER_PAGE = 4;

const RecentCharts = () => {
  const [chartsBySection, setChartsBySection] = useState({
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
  });

  const [pageIndex, setPageIndex] = useState({
    today: 0,
    yesterday: 0,
    lastWeek: 0,
    lastMonth: 0,
  });

  const navigate = useNavigate();

useEffect(() => {
  const fetchCharts = async () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const res = await axios.get(`${BACKEND_URL}/api/recentCharts`, config);
      const now = moment().startOf('day'); // ⬅️ Important fix here

      const seen = {};
      const grouped = {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
      };

      res.data.forEach((chart) => {
        const created = moment(chart.createdAt).startOf('day'); // ⬅️ Fix here too
        const daysAgo = now.diff(created, 'days');

        let groupKey = null;
        if (daysAgo === 0) groupKey = 'today';
        else if (daysAgo === 1) groupKey = 'yesterday';
        else if (daysAgo <= 7) groupKey = 'lastWeek';
        else if (daysAgo <= 30) groupKey = 'lastMonth';

        if (groupKey) {
          const dateKey = created.format('YYYY-MM-DD');
          const uniqueKey = `${dateKey}_${chart.recordId}`;
          if (!seen[uniqueKey]) {
            grouped[groupKey].push(chart);
            seen[uniqueKey] = true;
          }
        }
      });

      setChartsBySection(grouped);
    } catch (err) {
      console.error('Failed to fetch recent charts:', err);
    }
  };

  fetchCharts();
}, []);


  const renderSection = (label, sectionKey, items, showUpload = false) => {
    const page = pageIndex[sectionKey];
    const allItems = showUpload ? [...items, { isUploadTile: true }] : items;
    const totalPages = Math.ceil(allItems.length / TILES_PER_PAGE);
    const pagedItems = allItems.slice(page * TILES_PER_PAGE, (page + 1) * TILES_PER_PAGE);

    const isEmpty = items.length === 0 && !showUpload;

    return (
      <div className="section">
        <h3 className="section-title">{label}</h3>

        {isEmpty ? (
          <p className="no-results-text">No results for {label}</p>
        ) : (
          <div className="tiles-wrapper">
            {page > 0 && (
              <div
                className="arrow left"
                onClick={() =>
                  setPageIndex((prev) => ({ ...prev, [sectionKey]: prev[sectionKey] - 1 }))
                }
              >
                <ChevronLeft size={20} />
              </div>
            )}

            <div className="section-row">
              {pagedItems.map((chart, index) =>
                chart.isUploadTile ? (
                  <div
                    key={`upload-${index}`}
                    className="upload-tile"
                    onClick={() => navigate('/dashboard/upload')}
                  >
                    <div className="plus-sign">+</div>
                    <p className="chart-filename">Upload</p>
                  </div>
                ) : (
                  <div
                    key={chart._id}
                    className="chart-tile"
                    onClick={() => navigate(`/dashboard/analytics/${chart.recordId}`)}
                  >
                    <img src="/images/exel.jpg" alt="Excel" className="chart-icon" />
                    <p className="chart-filename">{chart.filename}</p>
                  </div>
                )
              )}
            </div>

            {page < totalPages - 1 && (
              <div
                className="arrow right"
                onClick={() =>
                  setPageIndex((prev) => ({ ...prev, [sectionKey]: prev[sectionKey] + 1 }))
                }
              >
                <ChevronRight size={20} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="recent-charts-container">
      <h2 className="page-title">Recently Analyzed Charts</h2>
      {renderSection('Today', 'today', chartsBySection.today, true)}
      {renderSection('Yesterday', 'yesterday', chartsBySection.yesterday)}
      {renderSection('Last Week', 'lastWeek', chartsBySection.lastWeek)}
      {renderSection('Last Month', 'lastMonth', chartsBySection.lastMonth)}
    </div>
  );
};

export default RecentCharts;
