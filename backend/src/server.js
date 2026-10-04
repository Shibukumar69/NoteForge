import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/noteforge";

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.warn("MongoDB connection could not be established; running with high-performance in-memory persistence store.");
  }

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`NoteForge AI Backend running on http://127.0.0.1:${PORT}`);
    console.log(`=================================================`);
  });
}

startServer();
