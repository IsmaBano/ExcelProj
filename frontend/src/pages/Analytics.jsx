import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import '../styles/analytics.css';

import { LineChart, Line as ReLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Bar, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import AISuggestion from './AISuggestion';
import ThreeDView from './ThreeDView';
import { useLocation } from 'react-router-dom';

// ✅ Chart.js core imports and registration
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { BACKEND_URL } from '../api/api';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);



const Analytics = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [chartType, setChartType] = useState('bar');
  const chartRef = useRef(null);
  const hasLoggedAnalyze = useRef(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const [zColumn, setZColumn] = useState('');
  const location = useLocation();
  

useEffect(() => {
  const fetchRecordAndLogAnalyze = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await axios.get(`${BACKEND_URL}/api/records/${id}`, config);
      setRecord(res.data);

      if (res.data.data && res.data.data.length > 0) {
        const keys = Object.keys(res.data.data[0]);
        setColumns(keys);
        setXColumn(keys[0]);
        setYColumn(keys.length > 1 ? keys[1] : keys[0]);
        setZColumn(keys.length > 2 ? keys[2] : keys[0]);
      }

      if (!hasLoggedAnalyze.current && location.state?.from !== 'recentCharts') {
        hasLoggedAnalyze.current = true;

        await axios.post(
  `${BACKEND_URL}/api/recentCharts`,
  {
    recordId: id,
    chartType, // 👈 send current chartType to backend
  },
  config
);


        await axios.post(
          `${BACKEND_URL}/api/activity/analyze/${id}`,
          { filename: res.data.filename || 'unknown file' },
          config
        );
      }
    } catch (error) {
      console.error('Error fetching record or logging:', error);
      toast.error('Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  fetchRecordAndLogAnalyze();
}, [id, location.state]);


useEffect(() => {
  const logChartView = async () => {
    if (!record || !record._id) return;

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${BACKEND_URL}/api/recentCharts`,
        {
          recordId: record._id,
          chartType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Error logging chart view by type:', error);
    }
  };

  const timeout = setTimeout(logChartView, 500); // debounce
  return () => clearTimeout(timeout);
}, [chartType]);


  if (loading) return <p>Loading...</p>;
  if (!record) return <p>No record found.</p>;
  if (!record.data || record.data.length === 0) return <p>No data available in Excel.</p>;

  const labels = record.data.map(row => {
    const val = row[xColumn];
    return val !== undefined && val !== null ? val.toString() : 'N/A';
  });

  const dataValues = record.data.map(row => {
    const val = row[yColumn];
    if (typeof val === 'number') return val;
    if (!isNaN(Number(val))) return Number(val);
    return 0;
  });

  const colorPalette = ['#FF6384', '#36A2EB', '#4CAF50']; // red, blue, green

  const chartData = {
    labels,
    datasets: [
      {
        label: yColumn,
        data: dataValues,
        backgroundColor: labels.map((_, idx) => colorPalette[idx % colorPalette.length]),
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 2,
        fill: chartType === 'line' || chartType === 'radar',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderRadius: chartType === 'bar' ? 8 : 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 14,
            family: 'Poppins',
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: `Chart (${chartType.toUpperCase()}) of ${yColumn} vs ${xColumn}`,
        color: '#111',
        font: {
          size: 18,
          family: 'Poppins',
          weight: '600',
        },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#444',
          font: { size: 12 },
        },
        grid: {
          color: '#eee',
          borderDash: [4, 4],
        },
      },
      y: {
        ticks: {
          color: '#444',
          font: { size: 12 },
        },
        grid: {
          color: '#eee',
          borderDash: [4, 4],
        },
      },
    },
  };

const renderChart = () => {
  const commonProps = { data: chartData, options };

  switch (chartType) {
    case 'line':
      return <Line {...commonProps} ref={chartRef} />;

    case 'bar':
      return <Bar {...commonProps} ref={chartRef} />;

    case 'horizontalBar': {
      const horizontalOptions = {
        ...options,
        indexAxis: 'y',
      };
      return <Bar data={chartData} options={horizontalOptions} ref={chartRef} />;
    }

    case 'area': {
      const areaOptions = {
        ...options,
        plugins: {
          ...options.plugins,
        },
        elements: {
          line: { fill: true },
        },
      };
      return <Line data={chartData} options={areaOptions} ref={chartRef} />;
    }

    case 'sparkline': {
      const sparklineData = chartData.datasets[0].data.map((value, index) => ({
        label: labels[index],
        value,
      }));

      return (
        <div id="sparkline-container"style={{ width: '100%', height: 200 }} ref={chartRef}>
          <ResponsiveContainer>
            <LineChart data={sparklineData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <ReLine
                type="monotone"
                dataKey="value"
                stroke="#36A2EB"
                strokeWidth={2}
                dot={{ r: 3 }}
                isAnimationActive={true}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#333',
                  border: 'none',
                  borderRadius: 4,
                  color: '#fff',
                  fontSize: 12,
                  padding: 8,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    default:
      return <Bar {...commonProps} ref={chartRef} />;
  }
};


const downloadAsPNG = async () => {
  let targetNode;

  // Prefer Chart.js canvas if available
  if (chartRef.current?.canvas) {
    targetNode = chartRef.current.canvas;
  } else if (show3DView) {
    // 3D Plotly chart node
    targetNode = document.querySelector('.js-plotly-plot');
  } else {
    // Fallback for Recharts
    targetNode = document.querySelector('.chart-wrapper');
  }

  if (!targetNode) {
    toast.error('Chart not available');
    return;
  }

  try {
    const canvas = await html2canvas(targetNode, {
      backgroundColor: '#fff',
      useCORS: true,
      scale: 2,
    });
    const image = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = image;
    link.download = show3DView ? '3d-chart.png' : `chart-${chartType}.png`;
    link.click();
  } catch (err) {
    toast.error('Failed to download PNG');
    console.error('PNG Download Error:', err);
  }
};




const exportAllChartsAsPDF = async () => {
  const pdf = new jsPDF('landscape', 'px', 'a4');
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 30;
  let yOffset = margin;

  if (show3DView) {
    // Capture Plotly 3D chart
    const plotlyNode = document.querySelector('.js-plotly-plot');
    if (plotlyNode) {
      const canvas = await html2canvas(plotlyNode, {
        backgroundColor: '#fff',
        useCORS: true,
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');

      pdf.text('3D CHART', margin, yOffset);
      pdf.addImage(imgData, 'PNG', margin, yOffset + 10, 550, 300);
    } else {
      toast.error('3D chart not found');
    }

    pdf.save('3d-chart.pdf');
    return;
  }

  // 2D Charts export
  const chartTypes = ['bar', 'line', 'horizontalBar'];
  for (const type of chartTypes) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    await new Promise((resolve) => {
      setTimeout(() => {
        const chart = new Chart(ctx, {
          type: type === 'horizontalBar' ? 'bar' : type,
          data: chartData,
          options: {
            ...options,
            indexAxis: type === 'horizontalBar' ? 'y' : 'x',
            responsive: false,
            animation: false,
            plugins: {
              legend: { display: true },
              title: {
                display: true,
                text: `${type.toUpperCase()} Chart`,
              },
            },
          },
        });

        setTimeout(() => {
          const imageData = canvas.toDataURL('image/png');

          if (yOffset + 260 > pageHeight - margin) {
            pdf.addPage();
            yOffset = margin;
          }

          pdf.text(type.toUpperCase() + ' Chart', margin, yOffset);
          pdf.addImage(imageData, 'PNG', margin, yOffset + 10, 550, 250);
          chart.destroy();
          yOffset += 280;
          resolve();
        }, 300);
      }, 100);
    });
  }

  // Sparkline (Recharts)
  const sparklineNode = document.querySelector('#sparkline-container');
  if (sparklineNode) {
    const canvas = await html2canvas(sparklineNode, {
      backgroundColor: '#fff',
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');

    if (yOffset + 160 > pageHeight - margin) {
      pdf.addPage();
      yOffset = margin;
    }

    pdf.text('SPARKLINE', margin, yOffset);
    pdf.addImage(imgData, 'PNG', margin, yOffset + 10, 550, 150);
  }

  pdf.save('all-charts.pdf');
};




return (
  <div className={`analytics-container ${show3DView ? 'three-d-mode' : ''}`}>
    {/* 🧠 Floating AI Suggestions Toggle Button */}
    <button
      className="floating-ai-toggle"
      onClick={() => setShowAISuggestions(prev => !prev)}
    >
      {showAISuggestions ? '×' : '🤖'}
    </button>

    {/* 🎯 AI Suggestions Panel */}
    {showAISuggestions && (
      <div className="floating-ai-panel">
        <AISuggestion
  show3DView={show3DView}
  onClose={() => setShowAISuggestions(false)}
  xColumn={xColumn}
  yColumn={yColumn}
  data={record?.data || []}
  onInsertSuggestion={({ chartType, xColumn, yColumn, zColumn }) => {
    setChartType(chartType);
    setXColumn(xColumn);
    setYColumn(yColumn);
    if (zColumn) setZColumn(zColumn);
    setShowAISuggestions(false); // Optionally close panel
  }}
/>

      </div>
    )}

    <h2 className="analytics-header">
      <b>Analytics for {record.filename || 'Uploaded File'}</b>
    </h2>

    <div className="chart-section">
      {/* Sidebar Controls */}
      <div className="sidebar-controls">
        {/* X-axis Dropdown */}
        <div>
          <label htmlFor="x-column-select">X-axis</label>
          <select
            id="x-column-select"
            value={xColumn}
            onChange={e => setXColumn(e.target.value)}
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Y-axis Dropdown */}
        <div>
          <label htmlFor="y-column-select">Y-axis</label>
          <select
            id="y-column-select"
            value={yColumn}
            onChange={e => setYColumn(e.target.value)}
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Z-axis Dropdown (only in 3D mode) */}
        {show3DView && (
          <div>
            <label htmlFor="z-column-select">Z-axis</label>
            <select
              id="z-column-select"
              value={zColumn}
              onChange={e => setZColumn(e.target.value)}
            >
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        )}

        {/* Export & 3D View Buttons */}
        <div className="download-buttons">
          <button onClick={downloadAsPNG}>Export as PNG</button>
          <button onClick={exportAllChartsAsPDF}>Export All Charts as PDF</button>
          <button onClick={() => setShow3DView(prev => !prev)}>
            {show3DView ? 'Close 3D View' : 'View in 3D'}
          </button>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="chart-display">
        <div style={{ width: '100%', textAlign: 'center' }}>
          {show3DView ? (
            <ThreeDView
              data={record?.data || []}
              xColumn={xColumn}
              yColumn={yColumn}
              zColumn={zColumn}
            />
          ) : (
            <>
              {/* Chart Type Toggle */}
              <div className="chart-type-toggle">
                {['bar', 'line', 'horizontalBar', 'area', 'sparkline'].map(type => (
                  <button
                    key={type}
                    className={chartType === type ? 'active' : ''}
                    onClick={() => setChartType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Chart Rendering */}
              <div className={`chart-wrapper ${['pie', 'radar'].includes(chartType) ? 'small' : 'large'}`}>
                {renderChart()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);






};

export default Analytics;
