// routes/openAIRoutes.js
import express from "express";
import { generateAIReport } from "../controllers/openAIController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// تولید گزارش AI (فقط برای یوزر لاگین شده)
router.post("/report", protect, generateAIReport);

export default router;
