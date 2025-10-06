// index.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import corsMiddleware from "./middleware/corsMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import taskDetailRoutes from "./routes/taskDetailRoutes.js";
import worklogRoutes from "./routes/worklogRoutes.js";
import attachmentRoutes from "./routes/attachmentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import openAIRoutes from "./routes/openAIRoutes.js";
import aiAssistantRoutes from "./routes/aiAssistantRoutes.js";

dotenv.config();
console.log("HF_API_KEY:", process.env.HF_API_KEY ? "Loaded" : "Not loaded");
connectDB();

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

//upload
app.use("/uploads", express.static("uploads"));
// Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/taskDetail", taskDetailRoutes);
app.use("/api/worklogs", worklogRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", openAIRoutes);
app.use("/api/ai", aiAssistantRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//m
