//projectRoutes.js

import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMemberToProject,
  removeMemberFromProject,
  addAttachmentToProject,
  removeAttachmentFromProject,
} from "../controllers/projectController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { searchProjects } from "../controllers/projectController.js";

const router = express.Router();

// CRUD project
router.post("/", protect, admin, createProject);
router.get("/", protect, getProjects);
router.get("/find", protect, searchProjects); //added
router.get("/:id", protect, getProjectById);
router.put("/:id", protect, admin, updateProject);
router.delete("/:id", protect, admin, deleteProject);

// member management
router.post("/:id/members", protect, admin, addMemberToProject);
router.delete("/:id/members/:userId", protect, admin, removeMemberFromProject);

// attachment management
router.post("/:id/attachments", protect, addAttachmentToProject);
router.delete(
  "/:id/attachments/:attachmentId",
  protect,
  removeAttachmentFromProject
);

export default router;
