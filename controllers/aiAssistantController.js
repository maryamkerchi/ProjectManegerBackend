// aiAssistantController.js
import OpenAI from "openai";
import { createTaskService } from "../Services/taskService.js";
import Project from "../models/projects.js";
import Task from "../models/tasks.js";
import User from "../models/users.js";
import Worklog from "../models/worklogs.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const aiAssistant = async (req, res) => {
  try {
    const { userMessage } = req.body;

    const projects = await Project.find({});
    const tasks = await Task.find({});
    const users = await User.find({});
    const worklogs = await Worklog.find({}); // ⬅️ استفاده برای بارکاری

    const prompt = `
You are a smart project management assistant.
Your responsibilities:
- Answer the user's questions clearly.
- Suggest tasks with proper assignment and due dates.
- Only assign tasks to members of the corresponding project.
- Consider user workloads from worklogs when assigning tasks (avoid overloading busy users).
- Provide JSON tasks in this exact format:

[
  {
    "title": "Task title",
    "description": "Task description",
    "projectId": "project ObjectId",
    "assignedTo": "user ObjectId",
    "types": "Support|Training|Monitoring|Production|R&D",
    "priority": "low|medium|high",
    "status": "pending|in-progress|completed",
    "dueDate": "YYYY-MM-DD",
    "estimatedDurationHours": number
  }
]

User message: "${userMessage}"

Projects: ${JSON.stringify(projects, null, 2)}
Users: ${JSON.stringify(users, null, 2)}
Tasks: ${JSON.stringify(tasks, null, 2)}
Worklogs: ${JSON.stringify(worklogs, null, 2)}
`;

    // request to AI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const aiReply = response.choices[0].message.content;

    // get tasks json
    let suggestedTasks = [];
    try {
      const jsonMatch = aiReply.match(/\[.*\]/s);
      if (jsonMatch) suggestedTasks = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.log("No tasks suggested or JSON parse failed");
    }

    // create task
    const createdTasks = [];
    for (const taskData of suggestedTasks) {
      try {
        const task = await createTaskService(taskData, req.user._id);
        createdTasks.push(task);
      } catch (err) {
        console.error("Task creation failed:", err.message);
      }
    }

    res.json({
      message: aiReply,
      createdTasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Assistant failed" });
  }
};
