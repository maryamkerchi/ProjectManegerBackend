// projects.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["Support", "Training", "Monitoring", "Production", "R&D"], // نمونه دسته‌بندی‌ها
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],

    startDate: Date,
    endDate: Date,
    estimatedDurationHours: Number,
  },
  { timestamps: true } // createdAt و updatedAt
);

// OverwriteModelError
export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
