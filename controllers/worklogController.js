import Worklog from "../models/worklogs.js";
import Task from "../models/tasks.js";
import Attachment from "../models/attachments.js"; // اضافه شد

// 📌 ایجاد Worklog
export const createWorklog = async (req, res) => {
  try {
    const { taskId, statusChange, spentTime, comment } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 1️⃣ ثبت Worklog
    const worklog = await Worklog.create({
      task: taskId,
      user: req.user._id,
      statusChange,
      spentTime,
      comment,
    });

    let attachment = null;

    // 2️⃣ اگه فایل آپلود شده بود
    if (req.file) {
      const attachment = await Attachment.create({
        worklog: worklog._id,
        uploadedBy: req.user._id,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        type: "worklog",
      });

      worklog.attachments.push(attachment._id); // 👈 وصل کردن فایل به worklog
      await worklog.save();
    }

    // 3️⃣ آپدیت Task status اگر statusChange پر شده باشد
    if (statusChange) {
      task.status = statusChange;
      await task.save();
    }

    // 4️⃣ پاسخ شامل worklog و attachment
    res.status(201).json({
      ...worklog.toObject(),
      attachments: attachment ? [attachment] : [],
    });
  } catch (error) {
    console.error("❌ Error creating worklog:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📌 همه Worklog های یک تسک
export const getWorklogsByTask = async (req, res) => {
  try {
    const worklogs = await Worklog.find({ task: req.params.taskId })
      .populate("user", "firstName lastName email")
      .populate("attachments", "fileName fileUrl createdAt")
      .sort({ createdAt: -1 });

    res.json(worklogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Worklog تکی
export const getWorklogById = async (req, res) => {
  try {
    const worklog = await Worklog.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("task", "title");

    if (!worklog) return res.status(404).json({ message: "Worklog not found" });

    res.json(worklog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 آپدیت Worklog
export const updateWorklog = async (req, res) => {
  try {
    const { statusChange, spentTime, comment } = req.body;

    const worklog = await Worklog.findById(req.params.id);
    if (!worklog) return res.status(404).json({ message: "Worklog not found" });

    // فقط صاحب worklog یا ادمین بتونه تغییر بده
    if (
      worklog.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    worklog.statusChange = statusChange || worklog.statusChange;
    worklog.spentTime = spentTime || worklog.spentTime;
    worklog.comment = comment || worklog.comment;

    // اگر statusChange پر شده باشد، Task هم آپدیت شود
    if (statusChange) {
      const task = await Task.findById(worklog.task);
      if (task) {
        task.status = statusChange;
        await task.save();
      }
    }

    const updatedWorklog = await worklog.save();
    res.json(updatedWorklog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 حذف Worklog
export const deleteWorklog = async (req, res) => {
  try {
    const worklog = await Worklog.findById(req.params.id);
    if (!worklog) return res.status(404).json({ message: "Worklog not found" });

    // فقط صاحب worklog یا ادمین بتونه پاک کنه
    if (
      worklog.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await worklog.deleteOne();
    res.json({ message: "Worklog removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//test
