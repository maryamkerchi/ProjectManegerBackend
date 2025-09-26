// taskDetailController.js
import Task from "../models/tasks.js";
import Worklog from "../models/worklogs.js";
import Attachment from "../models/attachments.js";

// task detail with worklog attachment
export const getTaskDetail = async (req, res) => {
  try {
    const taskId = req.params.id;

    // find a task
    const task = await Task.findById(taskId)
      .populate("assignedTo", "firstName lastName email")
      .populate("projectId", "name description");

    if (!task) return res.status(404).json({ message: "Task not found" });

    // worklogs that related to task
    const worklogs = await Worklog.find({ task: taskId })
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    // attachmet related to worklog

    const worklogsWithAttachments = await Promise.all(
      worklogs.map(async (worklog) => {
        const attachments = await Attachment.find({ worklog: worklog._id })
          .populate("uploadedBy", "firstName lastName email")
          .sort({ createdAt: -1 });

        return {
          ...worklog.toObject(),
          attachments,
        };
      })
    );

    // last response
    res.json({
      task,
      worklogs: worklogsWithAttachments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
//nnn
//test
