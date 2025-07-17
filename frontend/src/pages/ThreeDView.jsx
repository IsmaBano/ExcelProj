import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import '../styles/ThreeDView.css';

const ThreeDView = ({ data, xColumn, yColumn, zColumn }) => {
  const [chartType, setChartType] = useState('points');

  if (!data || data.length === 0 || !xColumn || !yColumn || !zColumn) {
    return <p>No data available for 3D visualization.</p>;
  }

  const xData = data.map(row => row[xColumn]);
  const yData = data.map(row => row[yColumn]);
  const zData = data.map(row => row[zColumn]);

  const getPlotData = () => {
    switch (chartType) {
      case 'points':
        return [{
          x: xData,
          y: yData,
          z: zData,
          type: 'scatter3d',
          mode: 'markers',
          marker: {
            size: 5,
            color: zData,
            colorscale: 'Viridis',
            opacity: 0.8,
          },
        }];
      case 'bubbles':
        return [{
          x: xData,
          y: yData,
          z: zData,
          type: 'scatter3d',
          mode: 'markers',
          marker: {
            size: yData.map(y => Math.max(4, y / 10)),
            color: xData,
            colorscale: 'Portland',
            opacity: 0.7,
          },
        }];
      case 'pointline':
        return [{
          x: xData,
          y: yData,
          z: zData,
          type: 'scatter3d',
          mode: 'lines+markers',
          marker: {
            size: 4,
            color: 'blue',
          },
          line: {
            color: 'lightblue',
            width: 2,
          },
        }];
      default:
        return [];
    }
  };

  return (
    <div className="three-d-container">
      <div className="three-d-buttons">
        {[
          { type: 'points', label: 'Points' },
          { type: 'bubbles', label: 'Bubbles' },
          { type: 'pointline', label: 'Point + Line' },
        ].map(({ type, label }) => (
          <button
            key={type}
            className={chartType === type ? 'active' : ''}
            onClick={() => setChartType(type)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="plot-wrapper">
  <Plot
    data={getPlotData()}
    layout={{
      title: {
        text: `${chartType.toUpperCase()} of ${yColumn} vs ${xColumn} vs ${zColumn}`,
        font: { color: '#ffffff', size: 20 },
      },
      paper_bgcolor: '#121212',
      plot_bgcolor: '#121212',
      scene: {
        bgcolor: '#1e1e1e',
        xaxis: {
          title: xColumn,
          titlefont: { color: '#FF6384' },
          tickfont: { color: '#FF6384' },
          gridcolor: '#333',
          zerolinecolor: '#444',
        },
        yaxis: {
          title: yColumn,
          titlefont: { color: '#36A2EB' },
          tickfont: { color: '#36A2EB' },
          gridcolor: '#333',
          zerolinecolor: '#444',
        },
        zaxis: {
          title: zColumn,
          titlefont: { color: '#FFCE56' },
          tickfont: { color: '#FFCE56' },
          gridcolor: '#333',
          zerolinecolor: '#444',
        },
      },
      margin: { l: 0, r: 0, b: 0, t: 40 },
    }}
    style={{
      width: '100%',
      height: '450px',
      marginTop: '1rem',
      borderRadius: '10px',
    }}
    config={{ responsive: true }}
  />
</div>

    </div>
  );
};

export default ThreeDView;
