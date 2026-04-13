import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", unique: true },
    total: Number,
    percentage: Number,
    grade: String,
    subjectWise: [{ subject: String, marks: Number, trend: String }], // trend: 'improving', 'declining', 'stable'
    attendanceImpact: String, // 'positive', 'negative', 'neutral'
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    riskReasons: [String],
    prediction: { nextScore: Number, confidence: Number },
    recommendations: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Performance", performanceSchema);
