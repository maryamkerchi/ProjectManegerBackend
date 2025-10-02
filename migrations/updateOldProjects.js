// migrations/updateOldProjects.js
import "dotenv/config";
import mongoose from "mongoose";
import Project from "../models/projects.js"; // مسیر درست مدل Project

const updateOldProjects = async () => {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // مقادیر پیش‌فرض برای پروژه‌های قدیمی
    const defaultEstimatedHours = 0; // مدت زمان تخمینی به ساعت
    const defaultStartDate = null; // تاریخ شروع
    const defaultEndDate = null; // تاریخ پایان

    const result = await Project.updateMany(
      {}, // همه پروژه‌ها
      {
        $set: {
          startDate: defaultStartDate,
          endDate: defaultEndDate,
          estimatedDurationHours: defaultEstimatedHours,
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} projects`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

updateOldProjects();
