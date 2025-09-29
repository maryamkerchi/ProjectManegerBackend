// messageRoutes.js
import express from "express";
import {
  sendGeneralMessage,
  sendProjectMessage,
  sendDirectMessage,
  getInboxMessages,
  getSentMessages,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//send message
router.post("/general", protect, sendGeneralMessage);
router.post("/project", protect, sendProjectMessage);
router.post("/direct", protect, sendDirectMessage);

// inbox
router.get("/inbox", protect, getInboxMessages);
router.get("/sent", protect, getSentMessages);

export default router;
