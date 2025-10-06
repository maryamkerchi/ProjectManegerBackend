// aiAssistantController.js
import OpenAI from "openai";
import Project from "../models/projects.js";
import Task from "../models/tasks.js";
import User from "../models/users.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const aiAssistant = async (req, res) => {
  try {
    const { userMessage, projectName } = req.body;

    if (!projectName)
      return res.status(400).json({ error: "Project name is required" });

    // پیدا کردن پروژه
    const project = await Project.findOne({ name: projectName }).populate(
      "members",
      "firstName lastName email role"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });

    // فقط کاربران پروژه
    const users = await User.find({
      _id: { $in: project.members.map((m) => m._id) },
    });

    // فقط تسک‌های پروژه
    const tasks = await Task.find({ projectId: project._id });

    // prompt محدود و بدون داده‌های اضافی بزرگ
    const prompt = `
You are a smart project management assistant.
Your responsibilities:
- Suggest tasks for the project based on current tasks and team workload.
- Assign tasks only to project members.
- Output the suggested tasks in a clear, readable format for a user (do NOT include raw JSON).
- Include: task title, description, suggested assignee, priority, due date, estimated hours.

User message: "${userMessage}"
Project name: "${project.name}"
`;

    // درخواست به OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const aiReply = response.choices[0].message.content;

    // فقط متن قابل نمایش به کاربر برمی‌گردد، تسک‌ها هنوز ساخته نشده‌اند
    res.json({
      suggestedTasksText: aiReply,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Assistant failed" });
  }
};
