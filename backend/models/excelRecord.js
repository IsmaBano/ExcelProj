const mongoose = require('mongoose');

const excelRecordSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
},{timestamps:true});

module.exports = mongoose.model('ExcelRecord', excelRecordSchema);
