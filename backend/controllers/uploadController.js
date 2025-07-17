const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs'); // for file cleanup
const ExcelRecord = require('../models/excelRecord');
const Activity = require('../models/Activity');

const uploadExcelFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.xls' && ext !== '.xlsx') {
      fs.unlinkSync(req.file.path); // delete invalid file
      return res.status(400).json({ success: false, message: 'Only .xls and .xlsx files are allowed' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // Save record in DB
    const newRecord = new ExcelRecord({
      date: new Date().toISOString(),
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      data,
      filename: req.file.originalname,
    });

    const savedRecord = await newRecord.save();

    // Save activity log
    await Activity.create({
      userId: req.user.id,
      action: 'upload',
      filename: req.file.originalname,
      timestamp: new Date(),
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'File uploaded and data saved successfully',
      record: savedRecord,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server error during file upload' });
  }
};

module.exports = { uploadExcelFile };
