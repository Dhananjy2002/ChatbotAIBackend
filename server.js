// ⚠️ THIS MUST BE THE VERY FIRST IMPORT!
import "./config/env.js";

// Now other imports are safe
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { createUploadsDir } from "./utils/createUploadsDir.js";

// Connect DB
connectDB();

createUploadsDir();

const app = express();

// Middlewares
app.use(helmet());

// Updated CORS configuration for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", router);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chatbot API is running",
    version: "1.0.0",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  console.log(`🤖 AI Provider: ${process.env.PROVIDER}`);
});
