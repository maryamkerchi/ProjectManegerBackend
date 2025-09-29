import express from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getOnlyUsers, // 👈 اضافه شد
} from "../controllers/userController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// register and login
router.post("/register", registerUser);
router.post("/", protect, admin, registerUser);
router.post("/login", loginUser);

// user management
router.get("/", protect, admin, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, admin, deleteUser);

// فقط کاربرهای role=user
router.get("/onlyUsers", protect, getOnlyUsers); // 👈 اصلاح شد

export default router;
