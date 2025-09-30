import Message from "../models/message.js";
import User from "../models/users.js";
import Project from "../models/projects.js";

// send general message (just admin)
export const sendGeneralMessage = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { content } = req.body;

    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const message = await Message.create({
      sender: req.user._id,
      type: "general",
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// send project message (just admin)
export const sendProjectMessage = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { projectId, content } = req.body;

    if (!projectId || !content)
      return res
        .status(400)
        .json({ message: "Project and content are required" });

    const project = await Project.findById(projectId).populate("members");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const message = await Message.create({
      sender: req.user._id,
      type: "project",
      content,
      project: projectId,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// send direct message
export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content)
      return res
        .status(400)
        .json({ message: "Recipient and content are required" });

    const recipient = await User.findById(recipientId);
    if (!recipient)
      return res.status(404).json({ message: "Recipient not found" });

    // user can only message other users
    if (req.user.role === "user" && recipient.role !== "user") {
      return res.status(403).json({ message: "Cannot message admins" });
    }

    const message = await Message.create({
      sender: req.user._id,
      type: "direct",
      content,
      recipient: recipientId,
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// send automatic message when task is assigned
export const sendTaskAssignedMessage = async (task, senderId) => {
  try {
    if (!task.assignedTo) return;

    const content = `You have been assigned a new task: ${task.title}`;

    await Message.create({
      sender: senderId, // ✅ must provide sender
      type: "direct",
      content,
      recipient: task.assignedTo,
    });
  } catch (error) {
    console.error("Error sending task assigned message:", error);
  }
};

// get inbox messages
export const getInboxMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { type: "general" },
        { type: "project" },
        { type: "direct", recipient: req.user._id },
      ],
    })
      .populate("sender", "firstName lastName email role")
      .populate("recipient", "firstName lastName email role")
      .populate("project", "name members")
      .sort({ createdAt: -1 });

    // filter project messages to only include those where user is a member
    const filtered = messages.filter((msg) => {
      if (msg.type === "project") {
        return msg.project?.members.some(
          (memberId) => memberId.toString() === req.user._id.toString()
        );
      }
      return true;
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get sent messages
export const getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user._id })
      .populate("recipient", "firstName lastName email role")
      .populate("project", "name members")
      .sort({ createdAt: -1 });

    const filtered = messages.map((msg) => {
      if (msg.type === "project") {
        return {
          ...msg._doc,
          projectName: msg.project?.name || "Unknown",
        };
      }
      return msg;
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//ttt
