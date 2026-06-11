import express from 'express';
import RecentChart from '../models/recentChart.js';
import ExcelRecord from '../models/excelRecord.js';
import { protect } from '../middleware/auth.js';
 
const router = express.Router();
// POST /api/recentCharts
router.post('/', protect, async (req, res) => {
  try {
    const { recordId, chartType } = req.body;

    const record = await ExcelRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const recentChart = await RecentChart.create({
      userId: req.user.id,
      recordId,
      filename: record.filename,
      action: 'analyze', // or 'view' if needed
      chartType, // ✅ Store chart type like "Bar Chart", "Line Chart", etc.
    });

    res.status(201).json({ success: true, recentChart });
  } catch (err) {
    console.error('Error creating recent chart:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/recentCharts
router.get('/', protect, async (req, res) => {
  try {
    const recentCharts = await RecentChart.find({
      userId: req.user.id,
      action: 'analyze',
    }).sort({ createdAt: -1 });

    res.json(recentCharts);
  } catch (err) {
    console.error('Error fetching recent charts:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
