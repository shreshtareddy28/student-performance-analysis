// Drop database script
import mongoose from "mongoose";
import dotenv from 'dotenv'; 
dotenv.config();

const dropDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not defined. Set it in .env or your environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    await mongoose.connection.dropDatabase();
    console.log("✅ Database dropped successfully!");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error dropping database:", error.message);
    process.exit(1);
  }
};

dropDB();
