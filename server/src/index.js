import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure we always load the env file from the server folder,
// regardless of the current working directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { authRoutes } from "./routes/auth.routes.js";
import { patientRoutes } from "./routes/patient.routes.js";
import { reportRoutes } from "./routes/report.routes.js";

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser tools (curl/Postman) with no Origin header
      if (!origin) return callback(null, true);

      // allow configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // allow any localhost dev port for convenience
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(path.resolve(uploadDir)));

app.get("/health", (_req, res) => res.json({ ok: true, service: "cureai-api" }));

app.use("/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

await connectDb(process.env.MONGODB_URI);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`CureAI API listening on http://localhost:${port}`);
});

