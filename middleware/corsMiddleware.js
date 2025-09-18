const cors = require("cors");

const corsMiddleware = cors({
  origin: [
    "http://localhost:5173", //locally for test
    "https://projectmanagementfrontend-spda.onrender.com", // front adress
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

module.exports = corsMiddleware;
