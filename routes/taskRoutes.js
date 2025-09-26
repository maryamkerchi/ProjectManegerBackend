//taskRoutes.js
import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
  searchTasks,
} from "../controllers/taskController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD تسک‌ها
router.post("/", protect, createTask);
router.get("/", protect, getTasks);

router.get("/find", protect, searchTasks);

router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

router.put("/:id/assign", protect, admin, assignTask);
router.put("/:id/status", protect, updateTaskStatus);

export default router;
//test
