// aiAssistantRoutes.js
import express from "express";
import { aiAssistant } from "../controllers/aiAssistantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/assistant", protect, aiAssistant);

export default router;
