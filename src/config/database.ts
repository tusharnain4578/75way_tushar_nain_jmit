import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI: string = process.env.MONGODB_URI ?? "";

class Database {
  async connect(): Promise<void> {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to Database");
    } catch (error) {
      console.error("Error connecting to Database:", error);
    }
  }
}

export default new Database();
