//atachments.js
import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    worklog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worklog",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true },
    fileName: String,
    fileType: String,
    fileSize: Number,
    type: {
      type: String,
      enum: ["task", "project", "worklog"],
      default: "task",
    },
  },
  { timestamps: true }
);

// privent OverwriteModelError
export default mongoose.models.Attachment ||
  mongoose.model("Attachment", attachmentSchema);
