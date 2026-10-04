import express from "express";
import { getAllNotes, getNoteById, deleteNote } from "../controllers/notes.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getAllNotes);
router.get("/:id", authenticate, getNoteById);
router.delete("/:id", authenticate, deleteNote);

export default router;
