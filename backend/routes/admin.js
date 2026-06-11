import express from 'express';
import User from '../models/user.js';
import ExcelRecord from '../models/excelRecord.js';
import RecentChart from '../models/recentChart.js';
import Activity from '../models/Activity.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalUploads = await ExcelRecord.countDocuments();

    const chartAggregation = await RecentChart.aggregate([
      { $match: { chartType: { $exists: true, $ne: null } } },
      { $group: { _id: "$chartType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const mostUsedChart = chartAggregation[0]?._id || 'N/A';

    const uploadsPerDay = await ExcelRecord.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" } },
          uploads: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id",
          uploads: 1,
          _id: 0
        }
      }
    ]);

    const analyzedPerDay = await Activity.aggregate([
      { $match: { action: 'analyze' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          analyzed: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id",
          analyzed: 1,
          _id: 0
        }
      }
    ]);

    const chartDataMap = {};
    uploadsPerDay.forEach(({ date, uploads }) => {
      chartDataMap[date] = { date, uploads, analyzed: 0 };
    });
    analyzedPerDay.forEach(({ date, analyzed }) => {
      if (chartDataMap[date]) {
        chartDataMap[date].analyzed = analyzed;
      } else {
        chartDataMap[date] = { date, uploads: 0, analyzed };
      }
    });
    const chartData = Object.values(chartDataMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const twentySecondsAgo = new Date(Date.now() - 20 * 1000);
    const onlineCount = await User.countDocuments({
      role: 'user',
      lastSeen: { $gte: twentySecondsAgo }
    });
    const offlineCount = totalUsers - onlineCount;

    res.json({
      totalUsers,
      totalUploads,
      mostUsedChart,
      chartData,
      onlineStats: {
        online: onlineCount,
        offline: offlineCount
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

export default router;
