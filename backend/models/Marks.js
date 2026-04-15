import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
    studentRollNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    examType: {
      type: String,
      required: true,
      enum: ["mid1", "mid2", "endsem", "quiz", "assignment", "lab"],
      lowercase: true,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    academicYear: {
      type: String,
      trim: true,
      default: "",
    },
    faculty_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

marksSchema.virtual("percentage").get(function percentage() {
  return Number(((this.marksObtained / this.maxMarks) * 100).toFixed(2));
});

marksSchema.index({ studentRollNo: 1, subject: 1, examType: 1 }, { unique: true });

export default mongoose.model("Marks", marksSchema);
