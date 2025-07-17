import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#845EC2'];
const BAR_COLORS = ['#8884d8', '#FF8042', '#00C49F', '#FFBB28', '#FF6666'];

const truncate = (text, maxLength) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const ChartTrackingAnalytics = ({ data }) => {
  const mostViewed = data.viewedChartTypes?.[0]?._id || 'N/A';

  return (
    <div className="analytics-section">
      <h2>📈 Chart Tracking</h2>

      {/* Summary Cards */}
      <div className="summary-boxes" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div className="summary-card">
  🧑 Top Analyzer:&nbsp;
  <strong>
    {data.userAnalysisStats?.length > 0 ? data.userAnalysisStats[0].username : 'N/A'}
  </strong>
</div>

        <div className="summary-card">🏆 Most Viewed Chart: <strong>{mostViewed}</strong></div>
      </div>

      <div className="analytics-row">
        {/* Viewed Chart Types */}
        <div className="chart-box">
          <h4>Viewed Chart Types</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.viewedChartTypes}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {data.viewedChartTypes.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Analyzed Files */}
        <div className="chart-box">
          <h4>Top Analyzed Files</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.topAnalyzedFiles}>
              <XAxis
                dataKey="filename"
                tickFormatter={(name) => truncate(name, 10)}
                interval={0}
              />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Analysis Count']} />
              <Bar dataKey="count">
                {data.topAnalyzedFiles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peak Analysis Hours */}
      <div className="analytics-row">
        <div className="chart-box" style={{ width: '100%' }}>
          <h4>Peak Analysis Hours</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.peakAnalysisHours}>
              <XAxis
                dataKey="_id"
                label={{ value: 'Hour', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual User Analyzed Records */}
      <div className="chart-box" style={{ marginTop: '2rem', width: '100%' }}>
  <h4>Analyzed Records by Users</h4>
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  }}>
    {data.userAnalysisStats?.map((user, index) => {
      const total = data.userAnalysisStats.reduce((sum, u) => sum + u.count, 0);
      const percentage = total > 0 ? ((user.count / total) * 100).toFixed(0) : 0;

      return (
        <div key={index} style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          {/* Just Username */}
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
            {user.username}
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            background: '#eee',
            height: '6px',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${percentage}%`,
              background: '#00C49F',
              height: '100%'
            }} />
          </div>

          {/* Count */}
          <div style={{
            fontSize: '0.85rem',
            color: '#333',
            textAlign: 'right',
            marginTop: '4px',
            fontWeight: 500
          }}>
            {user.count} analyses
          </div>
        </div>
      );
    })}
  </div>
</div>

    </div>
  );
};

export default ChartTrackingAnalytics;
