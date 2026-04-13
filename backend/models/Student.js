import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  name: String,
  rollNumber: String,
  class: String,
  branch: { type: String, default: 'CSE' },
  attendancePercentage: { type: Number, default: 100 },
});


export default mongoose.model("Student", studentSchema);