import Task from "../models/tasks.js";
import Project from "../models/projects.js";
import User from "../models/users.js";

// 📌 ایجاد تسک
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      priority,
      dueDate,
      types,
      status,
    } = req.body;

    // بررسی پروژه
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // اگر assignedTo مشخص شده، کاربر رو هم پیدا کن
    let user = null;
    if (assignedTo) {
      user = await User.findById(assignedTo);
      if (!user) return res.status(404).json({ message: "User not found" });
    }

    // ایجاد تسک با ذخیره نام پروژه و نام کاربر اختصاص یافته
    const task = await Task.create({
      title,
      description,
      projectId,
      projectName: project.name,
      assignedTo,
      assignedUserName: user ? `${user.firstName} ${user.lastName}` : undefined,
      priority,
      dueDate,
      types,
      status,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 آپدیت تسک
export const updateTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, types, status, assignedTo } =
      req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (types) task.types = types;
    if (status) task.status = status;

    // اگر assignedTo تغییر کرده، باید assignedUserName رو هم آپدیت کنیم
    if (assignedTo && assignedTo !== String(task.assignedTo)) {
      const user = await User.findById(assignedTo);
      if (!user) return res.status(404).json({ message: "User not found" });

      task.assignedTo = assignedTo;
      task.assignedUserName = `${user.firstName} ${user.lastName}`;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 assign کردن تسک (فقط تغییر تخصیص کاربر)
export const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    task.assignedTo = userId;
    task.assignedUserName = `${user.firstName} ${user.lastName}`;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📌 حذف تسک
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne(); // حذف تسک از دیتابیس
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "firstName lastName email")
      .populate("project", "name description");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, projectId, assignedTo, types } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (projectId) filter.projectId = projectId; // توجه کن projectId هست، نه project
    if (types) filter.types = types;

    // حالا نقش کاربر رو چک کنیم:
    if (req.user.role === "admin") {
      // admin: همه تسک‌ها رو میاره
      if (assignedTo) {
        // اگه فیلتر assignedTo هم بود اعمالش کن
        filter.assignedTo = assignedTo;
      }
    } else {
      // user: فقط تسک‌هایی که به خودش اختصاص داره
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "firstName lastName email")
      .populate("projectId", "name"); // تو مدل پروژه با projectId ذخیره شده

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📌 تغییر وضعیت تسک به صورت جداگانه
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "in-progress", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
