import express from 'express';
import ExcelRecord from '../models/excelRecord.js';
import RecentChart from '../models/recentChart.js';
import Activity from '../models/Activity.js';
import User from '../models/user.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/usage-analytics', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const topUploaders = await ExcelRecord.aggregate([
      { $group: { _id: "$uploadedBy", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $match: { "user.role": "user" } },
      { $project: { username: "$user.username", count: 1 } }
    ]);

    const uploadTrends = await ExcelRecord.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const fileTypes = await ExcelRecord.aggregate([
      {
        $group: {
          _id: {
            $toLower: {
              $substrCP: [
                "$filename",
                { $subtract: [{ $strLenCP: "$filename" }, 4] },
                4
              ]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const allUsers = await User.find({ role: 'user' }).select('username profileImage');
    const userUploads = await ExcelRecord.aggregate([
      {
        $group: {
          _id: "$uploadedBy",
          count: { $sum: 1 },
          files: { $push: "$filename" }
        }
      }
    ]);
    const uploadMap = {};
    userUploads.forEach(upload => {
      uploadMap[upload._id.toString()] = {
        count: upload.count,
        files: upload.files
      };
    });
    const userUploadDetails = allUsers.map(user => {
      const uploads = uploadMap[user._id.toString()] || { count: 0, files: [] };
      return {
        username: user.username,
        profileImage: user.profileImage || "",
        count: uploads.count,
        files: uploads.files
      };
    });

    const viewedChartTypes = await RecentChart.aggregate([
      { $group: { _id: "$chartType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topAnalyzedFiles = await RecentChart.aggregate([
      { $match: { action: 'analyze' } },
      { $group: { _id: "$recordId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "excelrecords",
          localField: "_id",
          foreignField: "_id",
          as: "record"
        }
      },
      { $unwind: "$record" },
      { $project: { filename: "$record.filename", count: 1 } }
    ]);

    const peakAnalysisHours = await RecentChart.aggregate([
      { $project: { hour: { $hour: "$createdAt" } } },
      { $group: { _id: "$hour", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const exportStats = await Activity.aggregate([
      { $match: { action: { $in: ["export_pdf", "export_png"] } } },
      { $group: { _id: "$action", count: { $sum: 1 } } }
    ]);

    const dailyActiveUsers = await Activity.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            userId: "$userId"
          }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          activeUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const registrations = await User.aggregate([
      { $match: { role: "user" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const inactiveUsers = await User.find({
      lastLogin: { $lt: oneMonthAgo },
      role: "user"
    }).select("username email");

    const loginHeatmap = await Activity.aggregate([
      { $match: { action: "login" } },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$timestamp" },
          hour: { $hour: "$timestamp" }
        }
      },
      {
        $group: {
          _id: { day: "$dayOfWeek", hour: "$hour" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.day": 1, "_id.hour": 1 } }
    ]);

    const userAnalysisStats = await RecentChart.aggregate([
      { $match: { action: 'analyze' } },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          username: '$user.username',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      fileUploadStats: {
        topUploaders,
        uploadTrends,
        fileTypes,
        userUploadDetails
      },
      chartTracking: {
        viewedChartTypes,
        topAnalyzedFiles,
        peakAnalysisHours,
        exportStats,
        userAnalysisStats
      },
      userEngagement: {
        dailyActiveUsers,
        registrations,
        inactiveUsers,
        loginHeatmap
      }
    });

  } catch (err) {
    console.error('Admin Usage Analytics Error:', err.message);
    res.status(500).json({ message: 'Server error in usage analytics' });
  }
});

export default router;
