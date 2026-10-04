import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { Lecture } from "../models/Lecture.js";
import { Note } from "../models/Note.js";
import { AIBridgeService } from "../services/aiBridge.service.js";
import { CloudinaryService } from "../services/cloudinary.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory mock store
export const mockLectures = new Map();
export const mockNotes = new Map();

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const fetchYouTubeMeta = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "YouTube URL is required" });
    }
    const data = await AIBridgeService.getYouTubeInfo(url);
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

function extractSmartTags(title, customTags = []) {
  if (Array.isArray(customTags) && customTags.length > 0) {
    return customTags.map((t) => String(t).trim()).filter(Boolean);
  }
  const tags = new Set();
  if (title) {
    const segments = title.split(/[|\-\/,\[\]]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 30);
    for (const seg of segments) {
      if (/unit\s*\d+|module\s*\d+|chapter\s*\d+/i.test(seg)) {
        tags.add(seg);
      } else if (/oneshot|one\s*shot|revision|pyq|crash\s*course|aktu|sppu|gate/i.test(seg)) {
        tags.add(seg);
      } else if (/^[A-Za-z0-9\s.&]{2,20}$/.test(seg) && seg.length <= 15) {
        tags.add(seg);
      }
    }
    if (tags.size === 0) {
      const firstPart = title.split(/[|\-:]/)[0].trim();
      if (firstPart && firstPart.length < 30) tags.add(firstPart);
    }
  }
  return Array.from(tags).slice(0, 5);
}

export const createLectureFromYouTube = async (req, res) => {
  try {
    const { youtubeUrl, title, language, notesStyle, inkStyle, thumbnailUrl, tags } = req.body;
    if (!youtubeUrl) {
      return res.status(400).json({ success: false, message: "YouTube lecture URL is required." });
    }

    const lectureTitle = title || "YouTube Lecture Notes";
    const jobId = `job_yt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userId = req.user?._id || "user_demo";
    const lectureTags = extractSmartTags(lectureTitle, tags);

    let lectureData = {
      _id: `lec_${Date.now()}`,
      userId,
      title: lectureTitle,
      youtubeUrl,
      thumbnailUrl: thumbnailUrl || "",
      language: language || "en",
      notesStyle: notesStyle || "detailed",
      inkStyle: inkStyle || "royal_blue",
      tags: lectureTags,
      status: "downloading_youtube",
      progress: 10,
      jobId,
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        const created = await Lecture.create(lectureData);
        lectureData._id = created._id;
      } catch (e) {
        mockLectures.set(lectureData._id.toString(), lectureData);
      }
    } else {
      mockLectures.set(lectureData._id.toString(), lectureData);
    }

    mockLectures.set(lectureData._id.toString(), lectureData);

    // Trigger AI pipeline in background
    triggerProcessingPipeline(lectureData);

    return res.status(202).json({
      success: true,
      message: "YouTube lecture queued for processing",
      lecture: lectureData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { title, language, notesStyle, inkStyle } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "Please upload a lecture video file." });
    }

    const lectureTitle = title || file.originalname.replace(/\.[^/.]+$/, "");
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userId = req.user?._id || "user_demo";

    let lectureData = {
      _id: `lec_${Date.now()}`,
      userId,
      title: lectureTitle,
      videoPath: file.path,
      originalFileName: file.originalname,
      fileSize: file.size,
      language: language || "en",
      notesStyle: notesStyle || "detailed",
      inkStyle: inkStyle || "royal_blue",
      status: "sampling_frames",
      progress: 10,
      jobId,
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        const created = await Lecture.create(lectureData);
        lectureData._id = created._id;
      } catch (e) {
        mockLectures.set(lectureData._id.toString(), lectureData);
      }
    } else {
      mockLectures.set(lectureData._id.toString(), lectureData);
    }

    mockLectures.set(lectureData._id.toString(), lectureData);

    triggerProcessingPipeline(lectureData);

    return res.status(202).json({
      success: true,
      message: "Lecture uploaded and processing started",
      lecture: lectureData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

async function triggerProcessingPipeline(lecture) {
  try {
    lecture.status = lecture.youtubeUrl ? "downloading_youtube" : "sampling_frames";
    lecture.progress = 20;

    const aiResult = await AIBridgeService.processVideo({
      videoPath: lecture.videoPath,
      youtubeUrl: lecture.youtubeUrl,
      lectureTitle: lecture.title,
      jobId: lecture.jobId,
      inkStyle: lecture.inkStyle,
      notesStyle: lecture.notesStyle,
    });

    lecture.status = "completed";
    lecture.progress = 100;
    if (aiResult.lectureTitle && (!lecture.title || lecture.title === "YouTube Lecture Notes")) {
      lecture.title = aiResult.lectureTitle;
    }

    // Build instant high-speed note data with local URLs
    const initialPages = aiResult.renderedPages.map((relPageUrl, i) => ({
      pageNumber: i + 1,
      title: aiResult.studyGuide.pages[i]?.title || `Page ${i + 1}`,
      timestamp: aiResult.studyGuide.pages[i]?.timestamp || "00:00",
      topics: aiResult.studyGuide.pages[i]?.topics || [],
      summary: aiResult.studyGuide.pages[i]?.summary || "",
      imageUrl: relPageUrl,
    }));

    const noteData = {
      _id: `note_${Date.now()}`,
      userId: lecture.userId,
      lectureId: lecture._id,
      title: lecture.title,
      totalPages: aiResult.totalPages,
      pages: initialPages,
      extractedSlides: aiResult.extractedSlides || [],
      flashcards: aiResult.studyGuide.flashcards || [],
      mcqs: aiResult.studyGuide.mcqs || [],
      keyFormulas: aiResult.studyGuide.keyFormulas || [],
      importantPoints: aiResult.studyGuide.importantPoints || [],
      pdfUrl: aiResult.pdfUrl,
      slidesPdfUrl: aiResult.slidesPdfUrl || aiResult.pdfUrl,
      inkStyle: lecture.inkStyle,
      createdAt: new Date(),
    };

    // Save in both MongoDB and memory IMMEDIATELY so user gets instant 100% completion
    mockNotes.set(noteData._id.toString(), noteData);
    mockNotes.set(lecture._id.toString(), noteData);
    mockLectures.set(lecture._id.toString(), { ...lecture, status: "completed", progress: 100, noteId: noteData._id });

    if (isMongoConnected()) {
      try {
        await Note.create(noteData);
        await Lecture.findOneAndUpdate({ _id: lecture._id }, { status: "completed", progress: 100, title: lecture.title, noteId: noteData._id });
      } catch (err) {
        console.warn("MongoDB note creation fallback:", err.message);
      }
    }

    // Async Background Cloudinary Sync (Never blocks user UI)
    (async () => {
      try {
        const baseDir = path.resolve(__dirname, "../../../");
        const pageUploadPromises = aiResult.renderedPages.map(async (relPageUrl, i) => {
          let cloudPageUrl = null;
          try {
            const localPagePath = path.join(baseDir, relPageUrl);
            if (fs.existsSync(localPagePath)) {
              cloudPageUrl = await CloudinaryService.uploadFile(localPagePath, "noteforge/pages", "image");
            }
          } catch (err) {
            console.warn(`Cloudinary page upload warning for page ${i + 1}:`, err.message);
          }
          return cloudPageUrl;
        });

        const pdfUploadPromise = (async () => {
          let url = null;
          try {
            const localPdfPath = path.join(baseDir, aiResult.pdfUrl);
            if (fs.existsSync(localPdfPath)) {
              url = await CloudinaryService.uploadFile(localPdfPath, "noteforge/pdfs", "auto");
            }
          } catch (err) {
            console.warn("Cloudinary PDF upload warning:", err.message);
          }
          return url;
        })();

        const [uploadedPages, uploadedPdf] = await Promise.all([
          Promise.all(pageUploadPromises),
          pdfUploadPromise,
        ]);

        if (uploadedPdf) noteData.pdfUrl = uploadedPdf;
        uploadedPages.forEach((url, idx) => {
          if (url && noteData.pages[idx]) noteData.pages[idx].imageUrl = url;
        });

        mockNotes.set(noteData._id.toString(), noteData);
        mockNotes.set(lecture._id.toString(), noteData);
        if (isMongoConnected()) {
          await Note.findOneAndUpdate({ _id: noteData._id }, { pages: noteData.pages, pdfUrl: noteData.pdfUrl });
        }
      } catch (cloudErr) {
        console.warn("Background Cloudinary sync completed with local fallbacks:", cloudErr.message);
      }
    })();
  } catch (error) {
    console.error(`Pipeline failure for lecture ${lecture._id}:`, error);
    lecture.status = "failed";
    lecture.progress = 0;
    mockLectures.set(lecture._id.toString(), lecture);
    if (isMongoConnected()) {
      try {
        await Lecture.findOneAndUpdate({ _id: lecture._id }, { status: "failed", progress: 0 });
      } catch {
        // Fallback
      }
    }
  }
}

export const getLectureStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let lecture = mockLectures.get(id) || mockLectures.get(String(id));
    let note = mockNotes.get(id) || mockNotes.get(String(id)) || (lecture?.noteId ? mockNotes.get(lecture.noteId) : null);

    if (isMongoConnected()) {
      try {
        const dbLec = await Lecture.findOne({ _id: id });
        if (dbLec) {
          if (!lecture || dbLec.status === "completed") {
            lecture = dbLec;
          }
        }
        if ((lecture?.status === "completed" || dbLec?.status === "completed") && !note) {
          note = await Note.findOne({ $or: [{ lectureId: id }, { _id: id }, { _id: lecture?.noteId }] });
        }
      } catch (err) {
        console.warn("MongoDB status lookup fallback:", err.message);
      }
    }

    if (!note && lecture?.status === "completed") {
      for (const n of mockNotes.values()) {
        if (n.lectureId === id || n._id === id || n.lectureId?.toString() === id) {
          note = n;
          break;
        }
      }
    }

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    return res.json({
      success: true,
      lecture,
      note,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLectures = async (req, res) => {
  try {
    const userId = req.user._id;
    let lectures = [];

    if (isMongoConnected()) {
      try {
        lectures = await Lecture.find({ userId }).sort({ createdAt: -1 });
      } catch {
        lectures = Array.from(mockLectures.values()).sort((a, b) => b.createdAt - a.createdAt);
      }
    } else {
      lectures = Array.from(mockLectures.values()).sort((a, b) => b.createdAt - a.createdAt);
    }

    return res.json({ success: true, lectures });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      try {
        await Lecture.deleteOne({ _id: id });
        await Note.deleteMany({ $or: [{ lectureId: id }, { _id: id }] });
      } catch (err) {
        console.error("MongoDB delete error:", err);
      }
    }

    mockLectures.delete(id);
    mockNotes.delete(id);
    for (const [key, note] of mockNotes.entries()) {
      if (note.lectureId === id || note.lectureId?.toString() === id) {
        mockNotes.delete(key);
      }
    }

    return res.json({
      success: true,
      message: "Lecture and associated notes deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLectureTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ success: false, message: "Tags must be an array of strings" });
    }

    const cleanTags = tags.map((t) => String(t).trim()).filter(Boolean);

    let updatedLecture = null;
    if (isMongoConnected()) {
      try {
        updatedLecture = await Lecture.findOneAndUpdate(
          { _id: id },
          { $set: { tags: cleanTags } },
          { new: true }
        );
      } catch (err) {
        console.error("MongoDB tag update error:", err);
      }
    }

    if (mockLectures.has(id)) {
      const lec = mockLectures.get(id);
      lec.tags = cleanTags;
      mockLectures.set(id, lec);
      if (!updatedLecture) updatedLecture = lec;
    }

    return res.json({
      success: true,
      message: "Tags updated successfully",
      lecture: updatedLecture,
      tags: cleanTags,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
