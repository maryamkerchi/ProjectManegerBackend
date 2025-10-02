import User from "../models/users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // for hash and compare

// make JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "8h" });
};

// register user
export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      avatar,
      technicalSkills,
      weeklyCapacityHours,
      skillLevel,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "This User already exists" });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || "user",
      avatar,
      technicalSkills: technicalSkills || [],
      weeklyCapacityHours: weeklyCapacityHours || 40,
      skillLevel: skillLevel || "junior",
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      technicalSkills: user.technicalSkills,
      weeklyCapacityHours: user.weeklyCapacityHours,
      skillLevel: user.skillLevel,
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
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        technicalSkills: user.technicalSkills,
        weeklyCapacityHours: user.weeklyCapacityHours,
        skillLevel: user.skillLevel,
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

// get user detail
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) res.json(user);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update user info
export const updateUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      role,
      avatar,
      password,
      technicalSkills,
      weeklyCapacityHours,
      skillLevel,
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.avatar = avatar || user.avatar;
    user.technicalSkills = technicalSkills || user.technicalSkills;
    user.weeklyCapacityHours = weeklyCapacityHours || user.weeklyCapacityHours;
    user.skillLevel = skillLevel || user.skillLevel;

    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      technicalSkills: updatedUser.technicalSkills,
      weeklyCapacityHours: updatedUser.weeklyCapacityHours,
      skillLevel: updatedUser.skillLevel,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } catch (error) {
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

// get only regular users
export const getOnlyUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select(
      "firstName lastName email role technicalSkills weeklyCapacityHours skillLevel"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
