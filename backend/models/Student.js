import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'EE'],
    default: 'CSE'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);