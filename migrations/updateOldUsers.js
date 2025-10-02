import "dotenv/config"; // بارگذاری متغیرهای محیطی
import mongoose from "mongoose";
import User from "../models/users.js"; // مسیر درست مدل

const updateOldUsers = async () => {
  try {
    // اتصال به دیتابیس با URI از .env
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const defaultTechnicalSkills = ["Other"];
    const defaultWeeklyCapacity = 40;
    const defaultSkillLevel = "junior";

    const result = await User.updateMany(
      {},
      {
        $set: {
          technicalSkills: defaultTechnicalSkills,
          weeklyCapacityHours: defaultWeeklyCapacity,
          skillLevel: defaultSkillLevel,
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} users`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

updateOldUsers();
