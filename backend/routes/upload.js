const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const XLSX = require('xlsx');
const ExcelRecord = require('../models/excelRecord');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

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
// @desc    Upload Excel file, parse & store data, log activity
// @access  Protected
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Calculate metadata
    const numRows = jsonData.length;
    const numCols = numRows > 0 ? Object.keys(jsonData[0]).length : 0;
    const numSheets = workbook.SheetNames.length;
    const emptyRows = jsonData.filter(row =>
      Object.values(row).every(cell => cell === null || cell === '')
    ).length;

    // Save Excel data to DB
    const newRecord = new ExcelRecord({
      filename: req.file.originalname,
      data: jsonData,
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

    
    // Send back metadata in response
    res.status(200).json({
      success: true,
      message: 'File uploaded and saved successfully',
      record: {
        _id: savedRecord._id,
        filename: req.file.originalname,
        numRows,
        numCols,
        numSheets,
        emptyRows,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error while uploading file' });
  }
});

module.exports = router;
