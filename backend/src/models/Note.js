import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  userId: {
    type: String,
    required: true,
  },
  lectureId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  pages: [
    {
      pageNumber: Number,
      title: String,
      timestamp: String,
      topics: Array,
      summary: String,
      imageUrl: String,
    },
  ],
  extractedSlides: [
    {
      slideIndex: Number,
      timestamp: String,
      imageUrl: String,
    },
  ],
  flashcards: [
    {
      question: String,
      answer: String,
    },
  ],
  mcqs: [
    {
      question: String,
      options: [String],
      correctIndex: Number,
      explanation: String,
    },
  ],
  keyFormulas: [String],
  importantPoints: [String],
  pdfUrl: {
    type: String,
    required: true,
  },
  slidesPdfUrl: {
    type: String,
  },
  inkStyle: {
    type: String,
    default: "royal_blue",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Note = mongoose.model("Note", noteSchema);
