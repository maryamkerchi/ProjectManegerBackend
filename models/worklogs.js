const worklogSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    statusChange: { type: String, enum: ["todo", "in-progress", "done"] },
    spentTime: Number,
    comment: String,
  },
  { timestamps: true }
);

export default mongoose.model("Worklog", worklogSchema);
