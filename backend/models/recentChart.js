const mongoose = require('mongoose');

const recentChartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExcelRecord',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['analyze', 'view'], // only allow these two actions
    required: true,
  },
  chartType: {
    type: String, // e.g., "Bar Chart", "Line Chart", "3D Pie Chart"
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RecentChart', recentChartSchema);
