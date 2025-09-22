//tasks.js
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    types: {
      type: String,
      enum: ["Support", "Training", "Monitoring", "Production", "R&D"],
      required: true,
    },
    title: { type: String, required: true },
    description: String,

    // ذخیره شناسه پروژه + نام پروژه
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },

    // ذخیره شناسه کاربر اختصاص یافته + نام کامل کاربر
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedUserName: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    dueDate: Date,
  },
  { timestamps: true }
);

// جلوگیری از خطای OverwriteModelError
export default mongoose.models.Task || mongoose.model("Task", taskSchema);
