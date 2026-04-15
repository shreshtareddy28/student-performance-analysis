import Marks from "../models/Marks.js";
import Performance from "../models/Performance.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";

const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
};

const calculateRiskLevel = (percentage, attendance) => {
  if (percentage < 40 || attendance < 50) return "Critical";
  if (percentage < 55 || attendance < 65) return "High";
  if (percentage < 70 || attendance < 75) return "Moderate";
  return "Low";
};

const calculateConsistencyScore = (percentages) => {
  if (percentages.length < 2) return 100;
  const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
  const variance = percentages.reduce((sum, p) => sum + (p - mean) ** 2, 0) / percentages.length;
  return Math.max(0, Math.round(100 - Math.sqrt(variance) * 3));
};

const detectTrend = (scores) => {
  if (scores.length < 2) return "stable";
  const diff = scores[scores.length - 1] - scores[0];
  if (diff > 6) return "improving";
  if (diff < -6) return "declining";
  return "stable";
};

const getSubjectStrength = (percentage) => {
  if (percentage >= 80) return "Strong";
  if (percentage >= 60) return "Average";
  return "Weak";
};

const getFocusArea = (subject, percentage, trend) => {
  if (percentage < 50) return `Prioritize remedial practice in ${subject}`;
  if (trend === "declining") return `Review recent mistakes in ${subject}`;
  if (percentage > 85) return `Stretch into advanced problems for ${subject}`;
  return `Maintain steady revision in ${subject}`;
};

const buildBadges = ({ percentage, attendance, improvementIndex, consistencyScore }) => {
  const badges = [];
  if (percentage >= 85) badges.push("Academic Excellence");
  if (attendance >= 90) badges.push("Attendance Star");
  if (improvementIndex >= 8) badges.push("Most Improved");
  if (consistencyScore >= 85) badges.push("Consistency Champion");
  if (!badges.length) badges.push("Growth Journey");
  return badges;
};

const buildStudyPlan = ({ subjectWise, riskLevel, attendance }) => {
  const weakSubjects = subjectWise.filter((subject) => subject.strength === "Weak");
  const plan = weakSubjects.slice(0, 3).map((subject) => ({
    title: `Recover ${subject.subject}`,
    action: `Spend 45 focused minutes twice this week on ${subject.subject} and review one past assessment.`,
  }));

  if (attendance < 75) {
    plan.push({
      title: "Attendance Recovery",
      action: "Follow a strict attendance plan for the next 2 weeks and meet your advisor for accountability.",
    });
  }

  if (riskLevel === "Low") {
    plan.push({
      title: "Keep Momentum",
      action: "Continue weekly revision and attempt one higher-difficulty task in your strongest subject.",
    });
  }

  return plan.slice(0, 4);
};

const buildRecommendations = ({ subjectWise, riskLevel, consistencyScore, attendance }) => {
  const recommendations = [];
  const weakSubjects = subjectWise.filter((subject) => subject.strength === "Weak");
  const decliningSubjects = subjectWise.filter((subject) => subject.trend === "declining");

  if (weakSubjects.length) {
    recommendations.push(`Immediate focus needed in ${weakSubjects.map((subject) => subject.subject).join(", ")}.`);
  }
  if (decliningSubjects.length) {
    recommendations.push(`Performance is slipping in ${decliningSubjects.map((subject) => subject.subject).join(", ")}. Review recent assessments.`);
  }
  if (attendance < 75) {
    recommendations.push("Attendance is hurting overall performance. Restore class participation to protect future scores.");
  }
  if (consistencyScore < 70) {
    recommendations.push("Create a fixed weekly study rhythm to reduce score swings across assessments.");
  }
  if (riskLevel === "Low") {
    recommendations.push("You are in a healthy zone. Shift part of your effort to advanced practice and peer mentoring.");
  }
  if (!recommendations.length) {
    recommendations.push("Maintain your current pace and continue short revision cycles before each assessment.");
  }

  return recommendations.slice(0, 5);
};

const getStudentRankSnapshot = async (percentage) => {
  const higherPerformers = await Performance.countDocuments({ percentage: { $gt: percentage } });
  const totalStudents = await Student.countDocuments();
  const rank = higherPerformers + 1;
  const percentile = totalStudents > 0 ? Number((((totalStudents - rank) / totalStudents) * 100).toFixed(2)) : 0;
  return { rank, percentile };
};

const getClassAnalyticsData = async () => {
  const performances = await Performance.find().sort({ percentage: -1 });
  const subjectAveragesRaw = await Marks.aggregate([
    {
      $group: {
        _id: "$subject",
        totalObtained: { $sum: "$marksObtained" },
        totalMax: { $sum: "$maxMarks" },
        studentCount: { $addToSet: "$studentRollNo" },
      },
    },
    {
      $project: {
        subject: "$_id",
        averagePercentage: { $multiply: [{ $divide: ["$totalObtained", "$totalMax"] }, 100] },
        studentCount: { $size: "$studentCount" },
      },
    },
    { $sort: { averagePercentage: -1 } },
  ]);

  const subjectAverages = subjectAveragesRaw.map((item) => ({
    subject: item.subject,
    averagePercentage: Number(item.averagePercentage.toFixed(2)),
    studentCount: item.studentCount,
  }));

  const overallAverage = performances.length
    ? Number((performances.reduce((sum, item) => sum + item.percentage, 0) / performances.length).toFixed(2))
    : 0;

  return {
    overallAverage,
    subjectAverages,
    topPerformers: performances.slice(0, 5),
    weakestSubjects: [...subjectAverages].sort((a, b) => a.averagePercentage - b.averagePercentage).slice(0, 4),
    atRiskStudents: performances.filter((item) => ["High", "Critical"].includes(item.riskLevel)).slice(0, 5),
  };
};

export const calculatePerformance = async (req, res) => {
  try {
    const normalizedRollNo = req.params.rollNo.toUpperCase();
    const student = await Student.findOne({ rollNo: normalizedRollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const marksData = await Marks.find({ studentRollNo: normalizedRollNo }).sort({ date: 1 });
    if (!marksData.length) {
      return res.status(404).json({ message: "No marks found for this student" });
    }

    const subjectGroups = new Map();
    marksData.forEach((mark) => {
      const group = subjectGroups.get(mark.subject) || [];
      group.push(mark);
      subjectGroups.set(mark.subject, group);
    });

    let totalObtained = 0;
    let totalMax = 0;
    const subjectWise = [];

    subjectGroups.forEach((items, subject) => {
      const subjectObtained = items.reduce((sum, item) => sum + item.marksObtained, 0);
      const subjectMax = items.reduce((sum, item) => sum + item.maxMarks, 0);
      const subjectPercentage = Number(((subjectObtained / subjectMax) * 100).toFixed(2));
      const series = items.map((item) => (item.marksObtained / item.maxMarks) * 100);
      const trend = detectTrend(series);

      subjectWise.push({
        subject,
        obtained: subjectObtained,
        max: subjectMax,
        percentage: subjectPercentage,
        strength: getSubjectStrength(subjectPercentage),
        trend,
        focusArea: getFocusArea(subject, subjectPercentage, trend),
      });

      totalObtained += subjectObtained;
      totalMax += subjectMax;
    });

    const semesterGroups = new Map();
    marksData.forEach((mark) => {
      const sem = mark.semester || 1;
      const group = semesterGroups.get(sem) || [];
      group.push(mark);
      semesterGroups.set(sem, group);
    });

    const semesterWise = [];
    semesterGroups.forEach((items, semester) => {
      const obtained = items.reduce((sum, item) => sum + item.marksObtained, 0);
      const max = items.reduce((sum, item) => sum + item.maxMarks, 0);
      const percentage = Number(((obtained / max) * 100).toFixed(2));
      let suggestions = "Consistent performance.";
      if (percentage < 50) suggestions = "Needs immediate remediation in this semester's core subjects.";
      else if (percentage < 70) suggestions = "Focus on weak areas to improve overall grade.";
      else if (percentage >= 85) suggestions = "Excellent performance, maintain momentum.";
      semesterWise.push({ semester: Number(semester), obtained, max, percentage, suggestions });
    });
    semesterWise.sort((a, b) => a.semester - b.semester);

    const percentage = Number(((totalObtained / totalMax) * 100).toFixed(2));
    const attendance = Number(student.attendancePercentage || 0);
    const allPercentages = marksData.map((mark) => (mark.marksObtained / mark.maxMarks) * 100);
    const consistencyScore = calculateConsistencyScore(allPercentages);
    const improvementIndex =
      allPercentages.length < 2 ? 0 : Number((allPercentages[allPercentages.length - 1] - allPercentages[0]).toFixed(2));
    const riskLevel = calculateRiskLevel(percentage, attendance);
    const recentScores = allPercentages.slice(-3);
    const predictedScore = recentScores.length
      ? recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length + (attendance >= 80 ? 2 : -2)
      : percentage;
    const { rank, percentile } = await getStudentRankSnapshot(percentage);
    const recommendations = buildRecommendations({ subjectWise, riskLevel, consistencyScore, attendance });
    const studyPlan = buildStudyPlan({ subjectWise, riskLevel, attendance });
    const badges = buildBadges({ percentage, attendance, improvementIndex, consistencyScore });

    const performance = await Performance.findOneAndUpdate(
      { studentRollNo: normalizedRollNo },
      {
        studentRollNo: normalizedRollNo,
        totalObtained,
        totalMax,
        percentage,
        grade: calculateGrade(percentage),
        subjectWise,
        semesterWise,
        consistencyScore,
        riskLevel,
        attendanceScore: attendance,
        improvementIndex,
        rank,
        percentile,
        interventionPriority: riskLevel === "Critical" || riskLevel === "High" ? "Urgent" : riskLevel === "Moderate" ? "Support" : "Monitor",
        prediction: {
          nextScore: Number(Math.max(0, Math.min(100, predictedScore)).toFixed(2)),
          confidence: consistencyScore,
        },
        badges,
        recommendations,
        studyPlan,
        lastCalculated: new Date(),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Performance calculated successfully", performance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error calculating performance", error: error.message });
  }
};

export const getPerformance = async (req, res) => {
  try {
    const normalizedRollNo = req.params.rollNo.toUpperCase();

    if (req.user.role === "student") {
      const student = await Student.findOne({ user_id: req.user.userId });
      if (!student || student.rollNo !== normalizedRollNo) {
        return res.status(403).json({ message: "Forbidden: You can only view your own performance" });
      }
    }

    const performance = await Performance.findOne({ studentRollNo: normalizedRollNo });
    if (!performance) {
      return res.status(404).json({ message: "No performance record found. Please calculate performance first." });
    }

    res.status(200).json({ performance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching performance", error: error.message });
  }
};

export const getClassAnalytics = async (_req, res) => {
  try {
    const [students, facultyCount, analytics, recentAssessments, departments] = await Promise.all([
      Student.find(),
      Faculty.countDocuments(),
      getClassAnalyticsData(),
      Marks.find().sort({ date: -1 }).limit(10).populate("faculty_id", "name email"),
      Student.aggregate([
        { $group: { _id: "$branch", count: { $sum: 1 }, avgAttendance: { $avg: "$attendancePercentage" } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const passCount = analytics.topPerformers.length
      ? await Performance.countDocuments({ percentage: { $gte: 50 } })
      : 0;

    res.status(200).json({
      totalStudents: students.length,
      facultyCount,
      totalMarksRecords: await Marks.countDocuments(),
      overallAverage: analytics.overallAverage,
      passFailRatio: { pass: passCount, fail: Math.max((await Performance.countDocuments()) - passCount, 0) },
      topPerformers: analytics.topPerformers,
      weakestSubjects: analytics.weakestSubjects,
      subjectAverages: analytics.subjectAverages,
      atRiskStudents: analytics.atRiskStudents,
      departments: departments.map((item) => ({
        department: item._id,
        count: item.count,
        avgAttendance: Number(item.avgAttendance.toFixed(2)),
      })),
      alerts: [
        ...(analytics.atRiskStudents.length ? [`${analytics.atRiskStudents.length} students need immediate intervention.`] : ["No urgent student intervention cases at the moment."]),
        ...(analytics.weakestSubjects.length ? [`${analytics.weakestSubjects[0].subject} is the weakest performing subject right now.`] : []),
      ],
      recentAssessments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching class analytics", error: error.message });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const student = await Student.findOne({ user_id: req.user.userId });
      const performance = student ? await Performance.findOne({ studentRollNo: student.rollNo }) : null;

      return res.status(200).json({
        role: "student",
        stats: {
          rollNo: student?.rollNo || "",
          attendance: student?.attendancePercentage || 0,
          targetCgpa: student?.cgpaTarget || 0,
          currentPercentage: performance?.percentage || 0,
          riskLevel: performance?.riskLevel || "Not calculated",
        },
        badges: performance?.badges || [],
        studyPlan: performance?.studyPlan || [],
        recommendations: performance?.recommendations || [],
      });
    }

    const analytics = await getClassAnalyticsData();
    const [studentCount, facultyCount, performanceCount, urgentInterventions] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Performance.countDocuments(),
      Performance.countDocuments({ interventionPriority: "Urgent" }),
    ]);

    res.status(200).json({
      role: req.user.role,
      stats: {
        studentCount,
        facultyCount,
        performanceCount,
        urgentInterventions,
        averageScore: analytics.overallAverage,
      },
      topPerformers: analytics.topPerformers,
      weakestSubjects: analytics.weakestSubjects,
      atRiskStudents: analytics.atRiskStudents,
      alerts: analytics.atRiskStudents.length
        ? ["Urgent intervention queue has active students."]
        : ["No urgent intervention cases at the moment."],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard summary", error: error.message });
  }
};
