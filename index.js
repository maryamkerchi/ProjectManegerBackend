// index.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import corsMiddleware from "./middleware/corsMiddleware.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express(); // ⚡ این خط فراموش شده

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Routes
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
