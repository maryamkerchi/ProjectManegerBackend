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
  },
  { timestamps: true }
);

export default mongoose.model("Attachment", attachmentSchema);
