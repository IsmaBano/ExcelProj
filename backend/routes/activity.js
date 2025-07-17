const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/activity/recent
// GET /api/activity/recent (now returns all logs for the user)
router.get('/recent', protect, async (req, res) => {
  try {
    const logs = await Activity.find({ userId: req.user.id })
      .sort({ timestamp: -1 }); // No limit here
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity logs.' });
  }
});


// POST /api/activity/analyze/:id  (new analyze logging route)
router.post('/analyze/:id', protect, async (req, res) => {
  try {
    const { filename } = req.body;
    const recordId = req.params.id;
    
    // ✅ Always create a new log
    await Activity.create({
      userId: req.user.id,
      action: 'analyze',
      filename: filename || 'unknown file',
      recordId: recordId,
      timestamp: new Date(),
    });

    res.status(200).json({ success: true, message: 'Analyze activity logged' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to log analyze activity.' });
  }
});


router.get('/test-activity-log', protect, async (req, res) => {
  try {
    const log = await Activity.create({
      userId: req.user.id,
      action: 'delete', // ✅ should match enum
      filename: 'test.xlsx',
      recordId: new mongoose.Types.ObjectId(), // dummy ObjectId
    });
    res.json({ success: true, log });
  } catch (err) {
    console.error('❌ Activity log test failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
