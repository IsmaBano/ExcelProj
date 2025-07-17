const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    required: true,
    enum: ['upload', 'analyze', 'export', 'update-profile', 'update-photo', 'delete'],
  },
  filename: { type: String },
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Record' },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', activitySchema);
