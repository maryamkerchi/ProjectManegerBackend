import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getTaskDetail } from "../controllers/taskDetailController.js";

const router = express.Router();

// taskDetail with worklog و attachments
router.get("/:id", protect, getTaskDetail);

export default router;
//n
