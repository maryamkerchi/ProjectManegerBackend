import Worklog from "../models/Worklog.js";
import Task from "../models/Task.js";

// 📌 ایجاد Worklog
export const createWorklog = async (req, res) => {
  try {
    const { taskId, statusChange, spentTime, comment } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const worklog = await Worklog.create({
      task: taskId,
      user: req.user._id,
      statusChange,
      spentTime,
      comment,
    });

    res.status(201).json(worklog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 همه Worklog های یک تسک
export const getWorklogsByTask = async (req, res) => {
  try {
    const worklogs = await Worklog.find({ task: req.params.taskId })
      .populate("user", "firstName lastName email")
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
