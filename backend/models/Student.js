import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
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
    branch: {
      type: String,
      required: true,
      enum: ["CSE", "ECE", "ME", "CE", "EE", "IT", "AIML", "DS"],
      default: "CSE",
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    section: {
      type: String,
      trim: true,
      default: "A",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    advisorFacultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    guardianName: {
      type: String,
      trim: true,
      default: "",
    },
    guardianPhone: {
      type: String,
      trim: true,
      default: "",
    },
    cgpaTarget: {
      type: Number,
      min: 0,
      max: 10,
      default: 8,
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
