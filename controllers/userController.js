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
    console.log("BODY:", req.body); // ← اینجا اول
    const { firstName, lastName, email, password, role, avatar } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "This User already exists" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new record in db
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "user",
      avatar,
    });

    // return data and JWT to client
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

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
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

// update user info
export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, role, avatar, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.role = role || user.role;
    user.avatar = avatar || user.avatar;
    // 🔹 Handle password update
    if (password) {
      user.password = password;
      // password should be hashed in your User model pre-save hook
    }

    const updatedUser = await user.save();

    // 🔹 If password changed, issue new token
    const token = generateToken(user._id);

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
