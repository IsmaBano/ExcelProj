import express from 'express';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/activity/recent
router.get('/recent', protect, async (req, res) => {
  try {
    const logs = await Activity.find({ userId: req.user.id })
      .sort({ timestamp: -1 }); // No limit here
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity logs.' });
  }
});

// POST /api/activity/analyze/:id
router.post('/analyze/:id', protect, async (req, res) => {
  try {
    const { filename } = req.body;
    const recordId = req.params.id;

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

// GET /api/activity/test-activity-log
router.get('/test-activity-log', protect, async (req, res) => {
  try {
    const log = await Activity.create({
      userId: req.user.id,
      action: 'delete',
      filename: 'test.xlsx',
      recordId: new mongoose.Types.ObjectId(),
    });
    res.json({ success: true, log });
  } catch (err) {
    console.error('❌ Activity log test failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
