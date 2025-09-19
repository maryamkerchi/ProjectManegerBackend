// index.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import corsMiddleware from "./middleware/corsMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
