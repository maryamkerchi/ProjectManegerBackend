import express from "express";
import multer from "multer";
import {
  uploadAttachment,
  getAttachmentsByWorklog,
  deleteAttachment,
} from "../controllers/attachmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//  multer for upload files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // مسیر ذخیره فایل‌ها
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

//  Routes
router.post("/", protect, upload.single("file"), uploadAttachment);
router.get("/worklog/:worklogId", protect, getAttachmentsByWorklog);
router.delete("/:id", protect, deleteAttachment);

export default router;
