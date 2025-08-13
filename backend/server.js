const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Load environment variables
dotenv.config();



// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;


// Middleware
app.use(cors({
  origin: process.env.URL,
  credentials: true,
}));
app.use(express.json());

// Static file serving (for profile images or uploaded files)
app.use('/uploads', express.static('uploads'));

//Route Imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const uploadRoutes = require("./routes/upload");
const recordRoutes = require("./routes/record");
const activityRoutes = require("./routes/activity");
const aiSuggestionRoutes = require('./routes/aiRoutes');
const recentChartsRoutes = require('./routes/recentCharts');
const adminRoutes = require('./routes/admin');               
const adminAnalyticsRoutes = require('./routes/adminAnalytics'); 

// ✅ Mount API Routes
app.use("/api/auth", authRoutes);                   // Login/Register
app.use("/api/user", userRoutes);                   // Profile, block status
app.use("/api/upload", uploadRoutes);               // File uploads
app.use("/api/records", recordRoutes);              // Uploaded file info
app.use("/api/activity", activityRoutes);           // Activity logs
app.use("/api/ai", aiSuggestionRoutes);             // AI chart suggestions
app.use("/api/recentCharts", recentChartsRoutes);   // Recent chart logs
app.use("/api/admin", adminRoutes);                 // Admin: user controls
app.use("/api/admin", adminAnalyticsRoutes);        // Admin: usage analytics

// ✅ MongoDB Storage Stats Endpoint
app.get("/api/storage", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: "MongoDB not connected yet" });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: "Database object not available" });
    }

    const stats = await db.stats();
    const totalQuota = 512 * 1024 * 1024; // 512MB total quota

    res.json({
      storageSize: stats.storageSize,
      dataSize: stats.dataSize,
      totalQuota,
      collections: stats.collections,
      objects: stats.objects,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
    });
  } catch (error) {
    console.error("Error fetching DB stats:", error);
    res.status(500).json({ error: "Failed to fetch storage stats" });
  }
});

// Connect to MongoDB & Start Server
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

connectDB()
  .then(() => {
    console.log(" MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" Failed to connect to database:", err);
    process.exit(1);
  });
