import mongoose from 'mongoose';

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

const ExcelRecord = mongoose.model('ExcelRecord', excelRecordSchema);
export default ExcelRecord;
