//taskService.js
import Task from "../models/tasks.js";
import Project from "../models/projects.js";
import User from "../models/users.js";
import { sendTaskAssignedMessage } from "../controllers/messageController.js";

export const createTaskService = async (taskData, createdBy = null) => {
  const {
    title,
    description,
    projectId,
    assignedTo,
    priority,
    dueDate,
    types,
    status,
    estimatedDurationHours,
  } = taskData;

  //
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Project not found");

  //
  let user = null;
  if (assignedTo) {
    user = await User.findById(assignedTo);
    if (!user) throw new Error("User not found");
  }

  //
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
    status: status || "pending",
    estimatedDurationHours: estimatedDurationHours || 0,
  });

  //
  if (assignedTo && createdBy) {
    await sendTaskAssignedMessage(task, createdBy);
  }

  return task;
};
