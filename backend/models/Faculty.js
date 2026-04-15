import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["CSE", "ECE", "ME", "CE", "EE", "IT", "AIML", "DS"],
      default: "CSE",
    },
    designation: {
      type: String,
      trim: true,
      default: "Faculty",
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
