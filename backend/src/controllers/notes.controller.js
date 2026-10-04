import mongoose from "mongoose";
import { Note } from "../models/Note.js";
import { mockNotes } from "./lecture.controller.js";

const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getAllNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    let notes = [];

    if (isMongoConnected()) {
      try {
        notes = await Note.find({ userId }).sort({ createdAt: -1 });
      } catch {
        notes = Array.from(mockNotes.values()).sort((a, b) => b.createdAt - a.createdAt);
      }
    } else {
      notes = Array.from(mockNotes.values()).sort((a, b) => b.createdAt - a.createdAt);
    }

    return res.json({ success: true, notes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    let note = null;

    if (isMongoConnected()) {
      try {
        note = await Note.findOne({ $or: [{ _id: id }, { lectureId: id }] });
      } catch {
        note = mockNotes.get(id);
      }
    }

    if (!note) {
      note = mockNotes.get(id);
      if (!note) {
        for (const n of mockNotes.values()) {
          if (n.lectureId === id || n._id === id || n.lectureId?.toString() === id) {
            note = n;
            break;
          }
        }
      }
    }

    if (!note) {
      return res.status(404).json({ success: false, message: "Study notes not found" });
    }

    return res.json({ success: true, note });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      try {
        await Note.findOneAndDelete({ $or: [{ _id: id }, { lectureId: id }] });
      } catch {
        mockNotes.delete(id);
      }
    } else {
      mockNotes.delete(id);
    }
    return res.json({ success: true, message: "Note removed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
