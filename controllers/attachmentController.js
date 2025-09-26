import Attachment from "../models/attachments.js";
import Worklog from "../models/worklogs.js";
import path from "path";
import fs from "fs";

// 📌 آپلود فایل برای یک Worklog
export const uploadAttachment = async (req, res) => {
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
      fileUrl: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      type: "worklog",
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 دریافت همه فایل‌های یک Worklog
export const getAttachmentsByWorklog = async (req, res) => {
  try {
    const attachments = await Attachment.find({ worklog: req.params.worklogId })
      .populate("uploadedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 حذف یک فایل
export const deleteAttachment = async (req, res) => {
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

    // حذف فایل از سرور
    if (fs.existsSync(attachment.fileUrl)) {
      fs.unlinkSync(attachment.fileUrl);
    }

    await attachment.deleteOne();
    res.json({ message: "Attachment removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 دانلود فایل
export const downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) return res.status(404).send("File not found");

    const filePath = path.join(process.cwd(), attachment.fileUrl);
    res.download(filePath, attachment.fileName);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading file");
  }
};
