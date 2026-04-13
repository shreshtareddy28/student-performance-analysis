import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Marks", marksSchema);