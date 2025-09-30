import User from "../models/users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // for hash and compare
// make JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "8h" }); // make sign
};
// register user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, avatar } = req.body;

    // ایمیل همیشه lowercase ذخیره شود
    const emailLower = email.toLowerCase();

    // بررسی وجود کاربر
    const userExists = await User.findOne({ email: emailLower });
    if (userExists)
      return res.status(400).json({ message: "This user already exists" });

    // فقط یکبار پاسورد plain به مدل می‌دهیم؛ pre-save hook خودش hash می‌کند
    const user = await User.create({
      firstName,
      lastName,
      email: emailLower,
      password, // بدون hash
      role: role || "user",
      avatar,
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    const user = await User.findOne({ email: emailLower });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// get all users list (just admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//  get user detail
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) res.json(user);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//update user
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, role, avatar, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.avatar = avatar || user.avatar;

    // فقط پسورد plain بدهید، مدل خودش hash می‌کند
    if (password) {
      user.password = password; // بدون bcrypt.hash
    }

    const updatedUser = await user.save();

    // در صورت نیاز می‌توانید token جدید بسازید
    const token = generateToken(updatedUser._id, updatedUser.role);

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      token, // new JWT
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOnlyUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select(
      "firstName lastName email role"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
