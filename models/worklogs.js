//worklogs.js
import mongoose from "mongoose";

const worklogSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    statusChange: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
    },
    spentTime: Number,
    comment: String,

    // 📌 اتصال به فایل‌های ضمیمه
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],
  },
  { timestamps: true }
);

// prevent OverwriteModelError
export default mongoose.models.Worklog ||
  mongoose.model("Worklog", worklogSchema);
