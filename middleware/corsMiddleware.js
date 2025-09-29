import cors from "cors";

const corsMiddleware = cors({
  origin: [
    "http://localhost:5174",
    "https://projectmanagementfrontend-spda.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});

export default corsMiddleware;
