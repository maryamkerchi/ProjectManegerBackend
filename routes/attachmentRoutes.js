// attachmentRoutes.js

import express from "express";
import multer from "multer";
import path from "path";
import Attachment from "../models/attachments.js";
import Worklog from "../models/worklogs.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Multer برای آپلود فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 📌 آپلود فایل (با احراز هویت)
router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    const { worklogId } = req.body;

    const worklog = await Worklog.findById(worklogId);
    if (!worklog) return res.status(404).json({ message: "Worklog not found" });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const attachment = await Attachment.create({
      worklog: worklogId,
      uploadedBy: req.user._id,
      fileName: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileSize: file.size,
      type: "worklog",
    });

    res.status(201).json(attachment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// 📌 دانلود فایل (بدون احراز هویت)
router.get("/download/:id", async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return res.status(404).send("File not found");

    const filePath = path.join(process.cwd(), attachment.fileUrl);
    res.download(filePath, attachment.fileName); // مرورگر فایل را دانلود می‌کند
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading file");
  }
});

// 📌 پیش‌نمایش فایل (بدون احراز هویت)
router.get("/preview/:id", async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return res.status(404).send("File not found");

    const filePath = path.join(process.cwd(), attachment.fileUrl);
    res.sendFile(filePath); // مرورگر فایل را نمایش می‌دهد (تصویر، PDF، متن و غیره)
  } catch (err) {
    console.error("Error previewing file:", err);
    res.status(500).send("Error previewing file");
  }
});

// 📌 همه فایل‌های یک Worklog (با احراز هویت)
router.get("/worklog/:worklogId", protect, async (req, res) => {
  try {
    const attachments = await Attachment.find({ worklog: req.params.worklogId })
      .populate("uploadedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// 📌 حذف فایل (با احراز هویت)
router.delete("/:id", protect, async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment)
      return res.status(404).json({ message: "Attachment not found" });

    if (
      attachment.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await attachment.deleteOne();
    res.json({ message: "Attachment removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
