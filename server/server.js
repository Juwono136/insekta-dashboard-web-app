import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import chartRoutes from "./routes/chartRoutes.js";

// Load environment variables
dotenv.config();

// Konfigurasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Inisialisasi App
const app = express();

// 2. Connect Database
connectDB();

// 3. Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/charts", chartRoutes);

app.use(notFound);
app.use(errorHandler);

// 4. Route Testing
app.get("/", (req, res) => {
  res.send("API Insekta Running (ES Modules) 🚀");
});

// 5. Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
});
