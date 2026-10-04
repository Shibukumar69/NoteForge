import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, "../../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `lecture_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "video/mkv", "video/webm", "video/avi", "video/quicktime"];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|mkv|webm|avi|mov)$/i)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files (.mp4, .mkv, .webm, .avi, .mov) are allowed!"), false);
  }
};

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max limit
  fileFilter,
});
