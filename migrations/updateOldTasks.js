// migrations/updateOldTasks.js
import "dotenv/config";
import mongoose from "mongoose";
import Task from "../models/tasks.js"; // مسیر درست مدل Task

const updateOldTasks = async () => {
  try {
    // اتصال به دیتابیس
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // مقدار پیش‌فرض برای تسک‌های قدیمی
    const defaultEstimatedHours = 0;

    const result = await Task.updateMany(
      {}, // همه تسک‌ها
      {
        $set: {
          estimatedDurationHours: defaultEstimatedHours,
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} tasks`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

updateOldTasks();
