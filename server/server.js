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
import teamRoutes from "./routes/teamRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";

// Load environment variables
dotenv.config();

// Konfigurasi __dirname untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
app.use("/api/teams", teamRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/channels", channelRoutes);

app.use(notFound);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API Insekta Running 🚀");
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server LOKAL berjalan di Port: ${PORT}`);
  });
}

export default app;
