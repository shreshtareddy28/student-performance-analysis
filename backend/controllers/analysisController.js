import Marks from "../models/Marks.js";
import Performance from "../models/Performance.js";
import Student from "../models/Student.js";

const calculatePerformanceForStudent = async (student_id) => {
  const marksData = await Marks.find({ student_id });
  const student = await Student.findById(student_id);
  if (!marksData || marksData.length === 0) {
    return null;
  }

  const total = marksData.reduce((sum, m) => sum + m.marks, 0);
  const percentage = (total / (marksData.length * 100)) * 100;

  let grade = "C";
  if (percentage > 80) grade = "A";
  else if (percentage > 60) grade = "B";

  // Subject-wise analysis with trends (simulated)
  const subjectWise = marksData.map(mark => {
    const trend = mark.marks > 70 ? 'stable' : mark.marks > 50 ? 'declining' : 'improving'; // Simple logic
    return { subject: mark.subject, marks: mark.marks, trend };
  });

  // Attendance impact
  let attendanceImpact = 'neutral';
  if (student.attendancePercentage > 85) attendanceImpact = 'positive';
  else if (student.attendancePercentage < 75) attendanceImpact = 'negative';

  // Risk detection
  let riskLevel = 'low';
  const riskReasons = [];
  if (percentage < 60) {
    riskLevel = 'high';
    riskReasons.push('Low overall percentage');
  }
  if (student.attendancePercentage < 75) {
    riskLevel = riskLevel === 'high' ? 'high' : 'medium';
    riskReasons.push('Low attendance');
  }
  const lowSubjects = subjectWise.filter(s => s.marks < 50);
  if (lowSubjects.length > 0) {
    riskLevel = 'high';
    riskReasons.push(`Needs attention in: ${lowSubjects.map(s => s.subject).join(', ')}`);
  }

  // Simple prediction (average of current marks)
  const avgMarks = total / marksData.length;
  const prediction = { nextScore: Math.min(100, avgMarks + 5), confidence: 0.7 };

  // Recommendations
  const recommendations = [];
  if (student.attendancePercentage < 75) recommendations.push('Improve attendance');
  lowSubjects.forEach(s => recommendations.push(`Focus more on ${s.subject}`));
  if (percentage < 70) recommendations.push('Seek additional tutoring');

  const performance = await Performance.findOneAndUpdate(
    { student_id },
    {
      total,
      percentage: Number(percentage.toFixed(2)),
      grade,
      subjectWise,
      attendanceImpact,
      riskLevel,
      riskReasons,
      prediction,
      recommendations,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return performance;
};

export const getSummary = async (req, res) => {
  try {
    const [totalStudents, totalMarksRecords, subjectAverages, studentAggregates] = await Promise.all([
      Student.countDocuments(),
      Marks.countDocuments(),
      Marks.aggregate([
        {
          $group: {
            _id: "$subject",
            averageMarks: { $avg: "$marks" },
          },
        },
        {
          $project: {
            _id: 0,
            subject: "$_id",
            averageMarks: { $round: ["$averageMarks", 2] },
          },
        },
        { $sort: { averageMarks: -1 } },
      ]),
      Marks.aggregate([
        {
          $group: {
            _id: "$student_id",
            totalMarks: { $sum: "$marks" },
            subjectCount: { $sum: 1 },
          },
        },
        {
          $addFields: {
            percentage: {
              $cond: [
                { $gt: ["$subjectCount", 0] },
                { $multiply: [{ $divide: ["$totalMarks", { $multiply: ["$subjectCount", 100] }] }, 100] },
                0,
              ],
            },
          },
        },
        { $sort: { percentage: -1 } },
      ]),
    ]);

    const averagePercentage = studentAggregates.length
      ? Number(
          (
            studentAggregates.reduce((sum, current) => sum + current.percentage, 0) /
            studentAggregates.length
          ).toFixed(2)
        )
      : 0;

    const aggregateWithStudent = await Marks.aggregate([
      {
        $group: {
          _id: "$student_id",
          totalMarks: { $sum: "$marks" },
          subjectCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          percentage: {
            $cond: [
              { $gt: ["$subjectCount", 0] },
              { $multiply: [{ $divide: ["$totalMarks", { $multiply: ["$subjectCount", 100] }] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: "$student.name",
          rollNumber: "$student.rollNumber",
          totalMarks: 1,
          percentage: { $round: ["$percentage", 2] },
        },
      },
      { $sort: { percentage: -1 } },
    ]);

    const topPerformers = aggregateWithStudent.slice(0, 3);
    const atRiskStudents = aggregateWithStudent.filter((student) => student.percentage < 60);

    // Additional analytics
    const passFailRatio = {
      pass: aggregateWithStudent.filter(s => s.percentage >= 40).length,
      fail: aggregateWithStudent.filter(s => s.percentage < 40).length,
    };

    const riskLevels = await Performance.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      totalStudents,
      totalMarksRecords,
      averagePercentage,
      topPerformers,
      atRiskCount: atRiskStudents.length,
      subjectAverages,
      passFailRatio,
      riskLevels,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard summary", error: error.message });
  }
};

export const calculatePerformance = async (req, res) => {
  try {
    const { student_id } = req.body;

    // Get all marks of student and student data
    const marksData = await Marks.find({ student_id });
    const student = await Student.findById(student_id);

    // Handle case: no marks found
    if (!marksData || marksData.length === 0) {
      return res.status(404).json({ message: "No marks found for this student" });
    }

    // Calculate total
    let total = 0;
    marksData.forEach((m) => {
      total += m.marks;
    });

    // Calculate percentage
    const percentage = (total / (marksData.length * 100)) * 100;

    // Assign grade
    let grade = "C";
    if (percentage > 80) grade = "A";
    else if (percentage > 60) grade = "B";

    // Subject-wise analysis with trends
    const subjectWise = marksData.map(mark => {
      const trend = mark.marks > 70 ? 'stable' : mark.marks > 50 ? 'declining' : 'improving';
      return { subject: mark.subject, marks: mark.marks, trend };
    });

    // Attendance impact
    let attendanceImpact = 'neutral';
    if (student && student.attendancePercentage > 85) attendanceImpact = 'positive';
    else if (student && student.attendancePercentage < 75) attendanceImpact = 'negative';

    // Risk detection - includes attendance
    let riskLevel = 'low';
    const riskReasons = [];
    if (percentage < 60) {
      riskLevel = 'high';
      riskReasons.push('Low overall percentage');
    }
    if (student && student.attendancePercentage < 75) {
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      riskReasons.push('Low attendance');
    }
    const lowSubjects = subjectWise.filter(s => s.marks < 50);
    if (lowSubjects.length > 0) {
      riskLevel = 'high';
      riskReasons.push(`Needs attention in: ${lowSubjects.map(s => s.subject).join(', ')}`);
    }

    // Prediction
    const avgMarks = total / marksData.length;
    const prediction = { nextScore: Math.min(100, avgMarks + 5), confidence: 0.7 };

    // Recommendations
    const recommendations = [];
    if (student && student.attendancePercentage < 75) recommendations.push('Improve attendance');
    lowSubjects.forEach(s => recommendations.push(`Focus more on ${s.subject}`));
    if (percentage < 70) recommendations.push('Seek additional tutoring');

    // Update existing performance or create one if missing
    const performance = await Performance.findOneAndUpdate(
      { student_id },
      {
        total,
        percentage: Number(percentage.toFixed(2)),
        grade,
        subjectWise,
        attendanceImpact,
        riskLevel,
        riskReasons,
        prediction,
        recommendations,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Send response
    res.status(200).json({
      message: "Performance calculated successfully",
      performance,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating performance", error: error.message });
  }
};

export const getPerformance = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    // Students can only view their own performance; faculty/admin can view any student
    if (req.user.role === "student") {
      const student = await Student.findOne({ user_id: req.user.userId });
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
      if (student._id.toString() !== student_id) {
        return res.status(403).json({ message: "Forbidden: You can only view your own performance" });
      }
    }
    
    const performance = await Performance.findOne({ student_id }).populate("student_id");

    if (!performance) {
      return res.status(404).json({ message: "No performance record found for this student" });
    }

    res.status(200).json({ performance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching performance", error: error.message });
  }
};