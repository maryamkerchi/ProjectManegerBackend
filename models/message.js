//message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["general", "project", "direct"],
      required: true,
    },
    content: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // just for direct
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // just for  project
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model("Message", messageSchema);
