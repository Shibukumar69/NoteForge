import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: [true, "Lecture title is required"],
    trim: true,
  },
  youtubeUrl: {
    type: String,
    trim: true,
  },
  thumbnailUrl: {
    type: String,
  },
  videoPath: {
    type: String,
  },
  originalFileName: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  duration: {
    type: Number,
    default: 0,
  },
  language: {
    type: String,
    default: "en",
  },
  notesStyle: {
    type: String,
    enum: ["detailed", "summary", "exam_revision", "formula_sheet"],
    default: "detailed",
  },
  inkStyle: {
    type: String,
    enum: ["royal_blue", "dark_charcoal", "navy_blue", "sepia"],
    default: "royal_blue",
  },
  status: {
    type: String,
    enum: ["queued", "downloading_youtube", "sampling_frames", "detecting_slides", "vision_analysis", "rendering_handwriting", "completed", "failed"],
    default: "queued",
  },
  progress: {
    type: Number,
    default: 0,
  },
  jobId: {
    type: String,
  },
  noteId: {
    type: String,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Lecture = mongoose.model("Lecture", lectureSchema);
