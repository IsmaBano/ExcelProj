const express = require('express');
const router = express.Router();
const ExcelRecord = require('../models/excelRecord');
const RecentChart = require('../models/recentChart');
const Activity = require('../models/Activity');
const User = require('../models/user');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/usage-analytics', protect, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    //  Top Uploaders (filter only normal users)
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

    // 📅 Upload Trends
    const uploadTrends = await ExcelRecord.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 📄 File Types
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

    // ✅ Individual User Upload Activity (only users with role: user)
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

    // 📊 Viewed Chart Types
    const viewedChartTypes = await RecentChart.aggregate([
      { $group: { _id: "$chartType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 🔍 Top Analyzed Files
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

    // ⏰ Peak Analysis Hours
    const peakAnalysisHours = await RecentChart.aggregate([
      { $project: { hour: { $hour: "$createdAt" } } },
      { $group: { _id: "$hour", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 📤 Export Stats
    const exportStats = await Activity.aggregate([
      { $match: { action: { $in: ["export_pdf", "export_png"] } } },
      { $group: { _id: "$action", count: { $sum: 1 } } }
    ]);

    // 📅 Daily Active Users
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

    // 🧑‍🤝‍🧑 Registrations (only role: user)
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

    // 😴 Inactive Users (only role: user)
    const inactiveUsers = await User.find({
      lastLogin: { $lt: oneMonthAgo },
      role: "user"
    }).select("username email");

    // 🔥 Login Heatmap
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

    // 📊 User-wise Analysis Count
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

    // ✅ Final Response
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

module.exports = router;