// users.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    avatar: { type: String },

    // فیلدهای جدید برای تحلیل AI
    technicalSkills: [
      {
        type: String,
        enum: [
          "tester",
          "backend programmer",
          "frontend programmer",
          "UI/UX",
          "DevOps",
          "R&D",
          "Other",
        ],
      },
    ],
    weeklyCapacityHours: { type: Number, default: 40 }, // ظرفیت کاری در هفته به ساعت
    skillLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "expert"],
      default: "junior",
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Helper برای بررسی رمز عبور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
