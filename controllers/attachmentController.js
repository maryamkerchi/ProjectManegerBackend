import Attachment from "../models/Attachment.js";
import Worklog from "../models/Worklog.js";

// 📌 آپلود فایل
export const uploadAttachment = async (req, res) => {
  try {
    const { worklogId } = req.body;

    const worklog = await Worklog.findById(worklogId);
    if (!worklog) return res.status(404).json({ message: "Worklog not found" });

    // اینجا فرض می‌کنیم فایل از طریق multer آپلود شده
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const attachment = await Attachment.create({
      worklog: worklogId,
      user: req.user._id,
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    });

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 دریافت همه فایل‌های یک Worklog
export const getAttachmentsByWorklog = async (req, res) => {
  try {
    const attachments = await Attachment.find({ worklog: req.params.worklogId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 حذف فایل
export const deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment)
      return res.status(404).json({ message: "Attachment not found" });

    // فقط صاحب فایل یا ادمین بتونه حذف کنه
    if (
      attachment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await attachment.deleteOne();
    res.json({ message: "Attachment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
