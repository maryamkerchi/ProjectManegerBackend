import Task from "../models/tasks.js";
import Project from "../models/projects.js";
import User from "../models/users.js";
import { sendTaskAssignedMessage } from "./messageController.js";

// Create task
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

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // If assignedTo is provided, find user
    let user = null;
    if (assignedTo) {
      user = await User.findById(assignedTo);
      if (!user) return res.status(404).json({ message: "User not found" });
    }

    // Create task with project name and assigned user name
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

    //  Auto-send message
    if (assignedTo) {
      await sendTaskAssignedMessage(task);
    }

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

      // 📌 ارسال پیام اتوماتیک بعد از تغییر تخصیص
      await sendTaskAssignedMessage(task);
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

    // فقط اگر کاربر تغییر کرده، پیام ارسال شود
    if (String(task.assignedTo) !== String(userId)) {
      task.assignedTo = userId;
      task.assignedUserName = `${user.firstName} ${user.lastName}`;

      await task.save();

      // 📌 ارسال پیام اتوماتیک
      await sendTaskAssignedMessage(task);
    } else {
      // اگر تغییر نکرده، فقط ذخیره می‌کنیم بدون ارسال پیام
      await task.save();
    }

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

//search according title and description
export const searchTasks = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    let filter = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };

    if (req.user.role !== "admin") {
      filter.assignedTo = req.user._id;
    }

    console.log("Search query:", query);
    console.log("Mongo filter:", JSON.stringify(filter, null, 2));

    const tasks = await Task.find(filter)
      .populate("assignedTo", "firstName lastName email")
      .populate("projectId", "name");

    console.log("Tasks found:", tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error("Error in searchTasks:", error);
    res.status(500).json({ message: error.message });
  }
};
//test
