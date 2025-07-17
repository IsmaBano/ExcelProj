// controllers/recordController.js (create this file)
const ExcelRecord = require('../models/excelRecord');

const getMyUploads = async (req, res) => {
  try {
    // req.user.id or req.user._id depends on your auth middleware
    const userId = req.user._id;

    // Find Excel records uploaded by this user
    const records = await ExcelRecord.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyUploads };
