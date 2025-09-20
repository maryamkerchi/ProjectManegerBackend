// models/projects.js

import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"], // planning حذف شد
      required: true, // باید حتماً انتخاب بشه
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
  },
  { timestamps: true }
);

// جلوگیری از خطای "OverwriteModelError"
export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
