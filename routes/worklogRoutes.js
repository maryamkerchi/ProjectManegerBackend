import express from "express";
import {
  createWorklog,
  getWorklogsByTask,
  getWorklogById,
  updateWorklog,
  deleteWorklog,
} from "../controllers/worklogController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Worklogs
router.post("/", protect, createWorklog);
router.get("/task/:taskId", protect, getWorklogsByTask);
router.get("/:id", protect, getWorklogById);
router.put("/:id", protect, updateWorklog);
router.delete("/:id", protect, deleteWorklog);

export default router;
