import express from "express";
import {
  createLecture,
  createLectureFromYouTube,
  fetchYouTubeMeta,
  getLectureStatus,
  getLectures,
  deleteLecture,
  updateLectureTags,
} from "../controllers/lecture.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { uploadVideo } from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/youtube-info", authenticate, fetchYouTubeMeta);
router.post("/create-from-youtube", authenticate, createLectureFromYouTube);
router.post("/create", authenticate, uploadVideo.single("video"), createLecture);
router.get("/:id/status", authenticate, getLectureStatus);
router.get("/", authenticate, getLectures);
router.delete("/:id", authenticate, deleteLecture);
router.patch("/:id/tags", authenticate, updateLectureTags);

export default router;
