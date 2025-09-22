import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
} from "../controllers/taskController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD تسک‌ها
router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

// عملیات خاص
router.put("/:id/assign", protect, admin, assignTask); // فقط ادمین assign می‌کنه
router.put("/:id/status", protect, updateTaskStatus); // هر کسی که دسترسی داره می‌تونه تغییر وضعیت بده

export default router;
