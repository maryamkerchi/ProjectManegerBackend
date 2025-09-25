//worklogRoutes.js
import express from "express";
import {
  createWorklog,
  getWorklogsByTask,
  getWorklogById,
  updateWorklog,
  deleteWorklog,
} from "../controllers/worklogController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; // 👈 اضافه شد

const router = express.Router();

// 📌 ایجاد worklog + آپلود فایل (اگه وجود داشت)
router.post("/", protect, upload.single("file"), createWorklog);

router.get("/task/:taskId", protect, getWorklogsByTask);
router.get("/:id", protect, getWorklogById);
router.put("/:id", protect, updateWorklog);
router.delete("/:id", protect, deleteWorklog);

export default router;
