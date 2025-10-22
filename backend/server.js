import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";

dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI ? "✅ Found" : "❌ Not Found");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

const PORT = process.env.PORT || 5000;

// Database connection - removed deprecated options
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));
} else {
  console.log("⚠️  Skipping MongoDB connection (no MONGO_URI in .env)");
}

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use!`);
    console.log('💡 Solution 1: Kill existing process with: taskkill /IM node.exe /F');
    console.log(`💡 Solution 2: Change PORT in .env to a different port (e.g., 5001)`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});