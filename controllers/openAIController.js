// controllers/openAIController.js
import OpenAI from "openai";
import Project from "../models/projects.js";
import Task from "../models/tasks.js";
import User from "../models/users.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// محاسبه درصد پیشرفت پروژه
const calculateProjectProgress = (projectTasks) => {
  const total = projectTasks.reduce(
    (sum, t) => sum + (t.estimatedDurationHours || 0),
    0
  );
  const completed = projectTasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + (t.estimatedDurationHours || 0), 0);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

// محاسبه ریسک پروژه بر اساس پیشرفت و زمان باقی مانده
const calculateProjectRisk = (project, progress) => {
  if (!project.endDate) return "Unknown";
  const remainingDays =
    (new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24);
  if (remainingDays <= 0 && progress < 100) return "High";
  if (remainingDays / 7 < (100 - progress) / 100) return "Medium";
  return "Low";
};

export const generateAIReport = async (req, res) => {
  try {
    const projects = await Project.find({});
    const tasks = await Task.find({});
    const users = await User.find({});

    // خلاصه پروژه‌ها
    const projectSummary = projects.map((p) => {
      const projectTasks = tasks.filter(
        (t) => t.projectId?.toString() === p._id.toString()
      );
      const progress = calculateProjectProgress(projectTasks);
      return {
        name: p.name,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        estimatedDurationHours: p.estimatedDurationHours,
        progress,
        risk: calculateProjectRisk(p, progress),
        tasks: projectTasks.map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority,
          types: t.types,
          estimatedDurationHours: t.estimatedDurationHours,
          assignedTo: t.assignedUserName,
        })),
      };
    });

    // خلاصه کاربران
    const userSummary = users.map((u) => {
      const assignedTasks = tasks.filter(
        (t) => String(t.assignedTo) === String(u._id)
      );
      const assignedHours = assignedTasks.reduce(
        (sum, t) => sum + (t.estimatedDurationHours || 0),
        0
      );
      return {
        name: `${u.firstName} ${u.lastName}`,
        role: u.role,
        technicalSkills: u.technicalSkills,
        weeklyCapacityHours: u.weeklyCapacityHours,
        skillLevel: u.skillLevel,
        assignedHours,
        workloadPercentage: u.weeklyCapacityHours
          ? Math.round((assignedHours / u.weeklyCapacityHours) * 100)
          : "N/A",
        assignedTasks: assignedTasks.map((t) => ({
          title: t.title,
          projectName: projects.find(
            (p) => p._id.toString() === t.projectId.toString()
          )?.name,
          status: t.status,
          priority: t.priority,
        })),
      };
    });

    // پرامپت برای AI
    const prompt = `
You are an AI project manager assistant.
Generate a **detailed English report** based on the following data:

Projects:
${JSON.stringify(projectSummary, null, 2)}

Users:
${JSON.stringify(userSummary, null, 2)}

Please include in your report:
1. Total projects and their statuses
2. Task distribution (pending, in-progress, completed)
3. User involvement and workload
4. Project progress percentages
5. Projects at risk
6. Users over or under capacity
7. Key insights and actionable recommendations for project management
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ report: response.choices[0].message.content });
  } catch (error) {
    console.error("AI Report Error:", error);
    res.status(500).json({ error: "Failed to generate AI report" });
  }
};
