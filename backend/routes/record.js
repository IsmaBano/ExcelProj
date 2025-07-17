const express = require('express');
const router = express.Router();
const ExcelRecord = require('../models/excelRecord');
const { protect } = require('../middleware/auth'); // Auth middleware to populate req.user
const Activity = require('../models/Activity');

/**
 * @route   GET /api/records/myuploads
 * @desc    Get all Excel uploads by the logged-in user
 * @access  Private
 */
router.get('/myuploads', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const uploads = await ExcelRecord.find({ uploadedBy: userId }).sort({ uploadedAt: -1 });
    res.status(200).json(uploads);
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/allfiles', async (req, res) => {
  try {
    const files = await ExcelRecord.find().populate('uploadedBy', 'username profileImage email');
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/excel/:id
// @desc    Delete a specific Excel file by ID
// @access  Protected (only admin or uploader can delete ideally)
router.delete('/allfiles/delete/:id', async (req, res) => {
  try {
    const record = await ExcelRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'File not found' });
    }

    await ExcelRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * @route   GET /api/records/:id
 * @desc    Get Excel record by ID
 * @access  Public or Private
 */
router.get('/:id', async (req, res) => {
  try {
    const record = await ExcelRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json(record);
  } catch (error) {
    console.error('Error fetching record by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/records/:id
 * @desc    Delete Excel record by ID
 * @access  Private (requires JWT and must be owner)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const record = await ExcelRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Optional: only allow the user who uploaded it to delete
    if (record.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await ExcelRecord.findByIdAndDelete(req.params.id);

    // ✅ Log the delete action (non-breaking addition)
    await Activity.create({
      userId: req.user.id,
      action: 'delete',
      filename: record.filename,
      recordId: record._id,
      timestamp: new Date(),
    });

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
