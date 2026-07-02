import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import { sendEvent, startConsumer } from "./kafka.js";

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

// Static file serving
app.use("/uploads", express.static("uploads"));

// Route Imports
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import uploadRoutes from "./routes/upload.js";
import recordRoutes from "./routes/record.js";
import activityRoutes from "./routes/activity.js";
import aiSuggestionRoutes from "./routes/aiRoutes.js";
import recentChartsRoutes from "./routes/recentCharts.js";
import adminRoutes from "./routes/admin.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.js";

// ✅ Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/ai", aiSuggestionRoutes);
app.use("/api/recentCharts", recentChartsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminAnalyticsRoutes);

// -------------------- Redis Setup --------------------
const redisClient = createClient({ url: "redis://redis:6379" });

redisClient.on("error", (err) => console.error("Redis error:", err));

(async () => {
  await redisClient.connect();
  console.log("✅ Redis connected");
})();

// Example: cache DB stats
app.get("/api/storage", async (req, res) => {
  try {
    const cached = await redisClient.get("dbStats");
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ error: "MongoDB not connected yet" });
    }

    const db = mongoose.connection.db;
    const stats = await db.stats();
    const totalQuota = 512 * 1024 * 1024;

    const result = {
      storageSize: stats.storageSize,
      dataSize: stats.dataSize,
      totalQuota,
      collections: stats.collections,
      objects: stats.objects,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
    };

    await redisClient.set("dbStats", JSON.stringify(result), { EX: 60 });
    res.json(result);
  } catch (error) {
    console.error("Error fetching DB stats:", error);
    res.status(500).json({ error: "Failed to fetch storage stats" });
  }
});

// -------------------- Kafka Usage --------------------
startConsumer("file-uploads");


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

//db connection
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });
