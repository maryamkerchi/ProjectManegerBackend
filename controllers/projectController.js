//projectController.js
import Project from "../models/projects.js";
import User from "../models/users.js";
import Attachment from "../models/attachments.js";

// create project (just admin)
export const createProject = async (req, res) => {
  try {
    const { name, description, members, status, attachments } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const project = await Project.create({
      name,
      description,
      status,
      createdBy: req.user._id,
      members: members || [],
      attachments: attachments || [],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all projects
export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === "admin") {
      projects = await Project.find()
        .populate("members", "firstName lastName email")
        .populate("attachments");
    } else {
      projects = await Project.find({ members: req.user._id })
        .populate("members", "firstName lastName email")
        .populate("attachments");
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get project by Id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .populate("attachments");

    if (!project) return res.status(404).json({ message: "Project not found" });

    if (req.user.role !== "admin" && !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update project
export const updateProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    const validStatuses = ["pending", "in-progress", "completed"];
    const projectStatus = validStatuses.includes(status) ? status : undefined;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.name = name || project.name;
    project.description = description || project.description;
    if (projectStatus) project.status = projectStatus;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await project.deleteOne();
    res.json({ message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// add member
export const addMemberToProject = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete member
export const removeMemberFromProject = async (req, res) => {
  try {
    const { userId } = req.params;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.members = project.members.filter((id) => id.toString() !== userId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// add attachment
export const addAttachmentToProject = async (req, res) => {
  try {
    const { fileUrl, fileName, fileType, fileSize } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const attachment = await Attachment.create({
      worklog: null,
      uploadedBy: req.user._id,
      fileUrl,
      fileName,
      fileType,
      fileSize,
    });

    project.attachments.push(attachment._id);
    await project.save();

    res.status(201).json(attachment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// remove attachment
export const removeAttachmentFromProject = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.attachments = project.attachments.filter(
      (id) => id.toString() !== attachmentId
    );
    await project.save();

    await Attachment.findByIdAndDelete(attachmentId);

    res.json({ message: "Attachment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// search projects by name or description
export const searchProjects = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const filter = {
      $or: [
        { name: { $regex: query.trim(), $options: "i" } },
        { description: { $regex: query.trim(), $options: "i" } },
      ],
    };

    let projects;

    if (req.user.role === "admin") {
      // admin see all projects
      projects = await Project.find(filter)
        .populate("members", "firstName lastName email")
        .populate("attachments");
    } else {
      // user just see own project
      projects = await Project.find({
        ...filter,
        members: req.user._id,
      })
        .populate("members", "firstName lastName email")
        .populate("attachments");
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//test
