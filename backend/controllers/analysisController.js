import Marks from "../models/Marks.js";
import Performance from "../models/Performance.js";
import Student from "../models/Student.js";

// Helper function to calculate grade
const calculateGrade = (percentage) => {
  if (percentage > 85) return 'A';
  if (percentage > 70) return 'B';
  if (percentage > 50) return 'C';
  return 'F';
};

// Helper function to calculate risk level
const calculateRiskLevel = (percentage) => {
  if (percentage > 75) return 'Low';
  if (percentage > 50) return 'Medium';
  return 'High';
};

// Helper function to calculate consistency score (0-100, higher is more consistent)
const calculateConsistencyScore = (percentages) => {
  if (percentages.length < 2) return 100; // Perfect consistency with one exam

  const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
  const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
  const stdDev = Math.sqrt(variance);

  // Convert to consistency score (lower std dev = higher consistency)
  const consistencyScore = Math.max(0, 100 - (stdDev * 10));
  return Math.round(consistencyScore);
};

// Helper function to detect trend
const detectTrend = (scores) => {
  if (scores.length < 2) return 'stable';

  const recent = scores.slice(-2);
  const diff = recent[1] - recent[0];

  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
};

// Helper function to determine subject strength
const getSubjectStrength = (percentage) => {
  if (percentage > 80) return 'Strong';
  if (percentage > 50) return 'Average';
  return 'Weak';
};

// Helper function to generate recommendations
const generateRecommendations = (performance) => {
  const recommendations = [];

  // Subject-specific recommendations
  performance.subjectWise.forEach(subject => {
    if (subject.strength === 'Weak') {
      recommendations.push(`Focus more on ${subject.subject} (currently ${subject.percentage.toFixed(1)}%)`);
    } else if (subject.strength === 'Strong') {
      recommendations.push(`Excellent performance in ${subject.subject}`);
    }
  });

  // Trend-based recommendations
  const improvingSubjects = performance.subjectWise.filter(s => s.trend === 'improving');
  const decliningSubjects = performance.subjectWise.filter(s => s.trend === 'declining');

  if (improvingSubjects.length > 0) {
    recommendations.push(`Keep up the good work in ${improvingSubjects.map(s => s.subject).join(', ')}`);
  }

  if (decliningSubjects.length > 0) {
    recommendations.push(`Address declining performance in ${decliningSubjects.map(s => s.subject).join(', ')}`);
  }

  // Consistency recommendations
  if (performance.consistencyScore < 70) {
    recommendations.push('Work on maintaining consistent performance across subjects');
  } else {
    recommendations.push('Maintain your consistent performance');
  }

  // Overall recommendations
  if (performance.grade === 'F') {
    recommendations.push('Seek additional academic support and tutoring');
  } else if (performance.grade === 'A') {
    recommendations.push('Continue your excellent academic performance');
  }

  return recommendations;
};

// Calculate performance for a student
export const calculatePerformance = async (req, res) => {
  try {
    const { rollNo } = req.params;

    // Check if student exists
    const student = await Student.findOne({ rollNo: rollNo.toUpperCase() });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get all marks for this student
    const marksData = await Marks.find({ studentRollNo: rollNo.toUpperCase() }).sort({ date: 1 });

    if (!marksData || marksData.length === 0) {
      return res.status(404).json({ message: "No marks found for this student" });
    }

    // Group marks by subject
    const subjectGroups = {};
    marksData.forEach(mark => {
      if (!subjectGroups[mark.subject]) {
        subjectGroups[mark.subject] = [];
      }
      subjectGroups[mark.subject].push(mark);
    });

    // Calculate subject-wise performance
    const subjectWise = [];
    let totalObtained = 0;
    let totalMax = 0;

    for (const [subject, marks] of Object.entries(subjectGroups)) {
      const subjectObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
      const subjectMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
      const subjectPercentage = (subjectObtained / subjectMax) * 100;

      // Get percentages for trend analysis
      const percentages = marks.map(m => (m.marksObtained / m.maxMarks) * 100);
      const trend = detectTrend(percentages);

      subjectWise.push({
        subject,
        obtained: subjectObtained,
        max: subjectMax,
        percentage: Number(subjectPercentage.toFixed(2)),
        strength: getSubjectStrength(subjectPercentage),
        trend
      });

      totalObtained += subjectObtained;
      totalMax += subjectMax;
    }

    // Calculate overall performance
    const percentage = (totalObtained / totalMax) * 100;
    const grade = calculateGrade(percentage);
    const riskLevel = calculateRiskLevel(percentage);

    // Calculate consistency score
    const allPercentages = marksData.map(m => (m.marksObtained / m.maxMarks) * 100);
    const consistencyScore = calculateConsistencyScore(allPercentages);

    // Generate recommendations
    const mockPerformance = {
      subjectWise,
      grade,
      consistencyScore
    };
    const recommendations = generateRecommendations(mockPerformance);

    // Prediction (simple weighted average)
    const recentMarks = marksData.slice(-3); // Last 3 exams
    const recentAvg = recentMarks.length > 0
      ? recentMarks.reduce((sum, m) => sum + (m.marksObtained / m.maxMarks) * 100, 0) / recentMarks.length
      : percentage;

    const prediction = {
      nextScore: Math.min(100, Math.max(0, recentAvg + (consistencyScore > 80 ? 2 : consistencyScore > 60 ? 0 : -2))),
      confidence: consistencyScore
    };

    // Get rank (this would be calculated across all students)
    const rank = await getStudentRank(rollNo.toUpperCase(), percentage);

    // Save or update performance
    const performance = await Performance.findOneAndUpdate(
      { studentRollNo: rollNo.toUpperCase() },
      {
        studentRollNo: rollNo.toUpperCase(),
        totalObtained,
        totalMax,
        percentage: Number(percentage.toFixed(2)),
        grade,
        subjectWise,
        consistencyScore,
        riskLevel,
        rank,
        prediction,
        recommendations,
        lastCalculated: new Date()
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Performance calculated successfully",
      performance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating performance", error: error.message });
  }
};

// Get performance for a student
export const getPerformance = async (req, res) => {
  try {
    const { rollNo } = req.params;

    // Students can only view their own performance; faculty/admin can view any student
    if (req.user.role === "student") {
      const student = await Student.findOne({ user_id: req.user.userId });
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
      if (student.rollNo !== rollNo.toUpperCase()) {
        return res.status(403).json({ message: "Forbidden: You can only view your own performance" });
      }
    }

    const performance = await Performance.findOne({ studentRollNo: rollNo.toUpperCase() });

    if (!performance) {
      return res.status(404).json({ message: "No performance record found. Please calculate performance first." });
    }

    res.status(200).json({ performance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching performance", error: error.message });
  }
};

// Get class analytics
export const getClassAnalytics = async (req, res) => {
  try {
    const [
      totalStudents,
      totalMarksRecords,
      subjectAverages,
      gradeDistribution,
      topPerformers,
      weakestSubjects,
      passFailRatio
    ] = await Promise.all([
      Student.countDocuments(),
      Marks.countDocuments(),
      // Subject averages
      Marks.aggregate([
        {
          $group: {
            _id: "$subject",
            totalObtained: { $sum: "$marksObtained" },
            totalMax: { $sum: "$maxMarks" },
            studentCount: { $addToSet: "$studentRollNo" }
          }
        },
        {
          $project: {
            subject: "$_id",
            averagePercentage: {
              $multiply: [{ $divide: ["$totalObtained", "$totalMax"] }, 100]
            },
            studentCount: { $size: "$studentCount" }
          }
        },
        { $sort: { averagePercentage: -1 } }
      ]),
      // Grade distribution
      Performance.aggregate([
        { $group: { _id: "$grade", count: { $sum: 1 } } }
      ]),
      // Top 5 performers
      Performance.find()
        .populate('studentRollNo', 'name rollNo branch')
        .sort({ percentage: -1 })
        .limit(5),
      // Weakest subjects (lowest average)
      Marks.aggregate([
        {
          $group: {
            _id: "$subject",
            totalObtained: { $sum: "$marksObtained" },
            totalMax: { $sum: "$maxMarks" }
          }
        },
        {
          $project: {
            subject: "$_id",
            averagePercentage: {
              $multiply: [{ $divide: ["$totalObtained", "$totalMax"] }, 100]
            }
          }
        },
        { $sort: { averagePercentage: 1 } },
        { $limit: 3 }
      ]),
      // Pass/Fail ratio
      Performance.aggregate([
        {
          $group: {
            _id: null,
            pass: {
              $sum: { $cond: [{ $gt: ["$percentage", 40] }, 1, 0] }
            },
            fail: {
              $sum: { $cond: [{ $lte: ["$percentage", 40] }, 1, 0] }
            }
          }
        }
      ])
    ]);

    const overallAverage = subjectAverages.length > 0
      ? subjectAverages.reduce((sum, subj) => sum + subj.averagePercentage, 0) / subjectAverages.length
      : 0;

    res.status(200).json({
      totalStudents,
      totalMarksRecords,
      overallAverage: Number(overallAverage.toFixed(2)),
      subjectAverages: subjectAverages.map(s => ({
        subject: s.subject,
        averagePercentage: Number(s.averagePercentage.toFixed(2)),
        studentCount: s.studentCount
      })),
      gradeDistribution,
      topPerformers,
      weakestSubjects: weakestSubjects.map(s => ({
        subject: s.subject,
        averagePercentage: Number(s.averagePercentage.toFixed(2))
      })),
      passFailRatio: passFailRatio[0] || { pass: 0, fail: 0 }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching class analytics", error: error.message });
  }
};

// Helper function to get student rank
const getStudentRank = async (rollNo, percentage) => {
  const higherPerformers = await Performance.countDocuments({
    percentage: { $gt: percentage }
  });
  return higherPerformers + 1;
};