import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeBase = String(file.originalname)
      .replace(/[^\w.\-() ]+/g, "_")
      .slice(0, 120);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${safeBase}`);
  }
});

// Only allow Word (.docx) medical reports for AI analysis
const allowed = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new Error("Unsupported file type"));
    return cb(null, true);
  }
});

