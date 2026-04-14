import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
    studentRollNo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      ref: "Student"
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    examType: {
      type: String,
      required: true,
      enum: ['mid1', 'mid2', 'endsem'],
      lowercase: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for percentage
marksSchema.virtual("percentage").get(function () {
  return (this.marksObtained / this.maxMarks) * 100;
});

// Compound index to prevent duplicate marks for same student, subject, exam
marksSchema.index({ studentRollNo: 1, subject: 1, examType: 1 }, { unique: true });

export default mongoose.model("Marks", marksSchema);