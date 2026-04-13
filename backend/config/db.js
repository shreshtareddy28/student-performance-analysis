import mongoose from "mongoose";
import dotenv from 'dotenv'; 
dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not defined. Set it in .env or your environment variables.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    if (error.code === "ECONNREFUSED" || error.name === "MongoNetworkError") {
      console.error("Check your MongoDB URI, network access, and DNS/SRV resolution.");
    }
    process.exit(1);
  }
};