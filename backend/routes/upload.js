import express from 'express';
import multer from 'multer';
import path from 'path';
import ExcelRecord from '../models/excelRecord.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';
import { sendEvent } from '../kafka.js';

const router = express.Router();

// Multer configuration (store in memory)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.xls' && ext !== '.xlsx') {
    return cb(new Error('Only Excel files are allowed'), false);
  }
  cb(null, true);
};
const upload = multer({ storage, fileFilter });

// @route   POST /api/upload
// @desc    Upload Excel file, save metadata, publish Kafka event
// @access  Protected
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Save metadata only
    const newRecord = new ExcelRecord({
      filename: req.file.originalname,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    });
    const savedRecord = await newRecord.save();

    // Log activity
    await Activity.create({
      userId: req.user.id,
      action: 'upload',
      filename: req.file.originalname,
      timestamp: new Date(),
    });

    // Publish job to Kafka (send buffer for parsing)
   await sendEvent("file-uploads", {
  fileId: savedRecord._id,
  filename: req.file.originalname,
  buffer: req.file.buffer,
  action: "parse",
  userId: req.user.id,
});

    res.status(200).json({
      success: true,
      message: 'Upload received, processing in background',
      record: { _id: savedRecord._id, filename: req.file.originalname }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error while uploading file' });
  }
});

export default router;
