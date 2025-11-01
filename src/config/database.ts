import mongoose from "mongoose";
import { config } from "./app";
import UtilServices from "../services/utilService";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.DB as string);
    console.log("✅ MongoDB connected");

    await UtilServices.superSignup();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

export default connectDB;