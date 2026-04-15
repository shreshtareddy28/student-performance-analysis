import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Performance({ auth }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [performance, setPerformance] = useState(null);
  const [error, setError] = useState("");

  const canCalculate = auth.role === "admin" || auth.role === "faculty";

  const loadPerformance = useCallback(async (rollNo = selectedStudent, recalculate = canCalculate) => {
    if (!rollNo) return;

    try {
      setError("");
      if (recalculate) {
        await api.post(`/api/analysis/calculate/${rollNo}`);
      }
      const response = await api.get(`/api/analysis/${rollNo}`);
      setPerformance(response.data.performance);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load performance");
    }
  }, [canCalculate, selectedStudent]);

  useEffect(() => {
    const loadStudentContext = async () => {
      try {
        if (auth.role === "student") {
          const response = await api.get("/api/students/me");
          const rollNo = response.data.student.rollNo;
          setSelectedStudent(rollNo);
          await loadPerformance(rollNo, false);
        } else {
          const response = await api.get("/api/students");
          setStudents(response.data.students || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load performance context");
      }
    };

    loadStudentContext();
  }, [auth.role, loadPerformance]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">Performance Intelligence</Typography>
          <Typography color="text.secondary">
            Combines marks, attendance, trend shifts, intervention priority, and a recovery plan.
          </Typography>
        </Box>
        {performance && (
          <Button variant="outlined" onClick={() => window.print()} sx={{ borderRadius: 999 }}>
            Print Report
          </Button>
        )}
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {auth.role !== "student" && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            select
            label="Select Student"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            sx={{ minWidth: 280 }}
          >
            {students.map((student) => (
              <MenuItem key={student._id} value={student.rollNo}>
                {student.name} ({student.rollNo})
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={() => loadPerformance()} disabled={!selectedStudent}>
            {canCalculate ? "Calculate and Refresh" : "Load Performance"}
          </Button>
        </Stack>
      )}

      {!canCalculate && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Student view shows the latest calculated record. Faculty and admin can refresh live analytics.
        </Alert>
      )}

      {performance && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "Overall", value: `${performance.percentage}%` },
              { label: "Grade", value: performance.grade },
              { label: "Risk", value: performance.riskLevel },
              { label: "Rank", value: `#${performance.rank}` },
            ].map((item) => (
              <Grid item xs={12} md={3} key={item.label}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">{item.label}</Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>{item.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              {performance.semesterWise && performance.semesterWise.length > 0 && (
                (() => {
                  const sortedSemesters = [...performance.semesterWise].sort((a, b) => a.semester - b.semester);
                  return (
                    <>
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2 }}>Semester Progression</Typography>
                          <Bar
                            data={{
                              labels: sortedSemesters.map((item) => `Semester ${item.semester}`),
                              datasets: [
                                {
                                  label: "Percentage",
                                  data: sortedSemesters.map((item) => item.percentage),
                              backgroundColor: ["#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#264653", "#219ebc", "#8ecae6", "#ffb703"],
                            },
                          ],
                        }}
                        options={{ responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }}
                      />
                    </CardContent>
                  </Card>
      
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {sortedSemesters.map((sem) => (
                      <Grid item xs={12} md={6} key={`sem-${sem.semester}`}>
                        <Card sx={{ height: "100%", background: "linear-gradient(180deg, #ffffff, #f9fbfd)" }}>
                          <CardContent>
                            <Typography variant="h6">Semester {sem.semester}</Typography>
                            <Typography sx={{ mt: 1 }} variant="h4">{sem.obtained}/{sem.max}</Typography>
                            <Typography color="text.secondary">{sem.percentage}%</Typography>
                            <LinearProgress variant="determinate" value={sem.percentage} sx={{ mt: 1.5, height: 8, borderRadius: 99 }} />
                            <Alert severity="info" sx={{ mt: 2 }}>{sem.suggestions}</Alert>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
                  );
                })()
              )}

              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Subject Momentum</Typography>
                  <Bar
                    data={{
                      labels: performance.subjectWise?.map((item) => item.subject) || [],
                      datasets: [
                        {
                          label: "Percentage",
                          data: performance.subjectWise?.map((item) => item.percentage) || [],
                          backgroundColor: ["#113c6b", "#187692", "#e86f2d", "#0d7a6f", "#8d493a"],
                        },
                      ],
                    }}
                    options={{ responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }}
                  />
                </CardContent>
              </Card>

              <Grid container spacing={2}>
                {(performance.subjectWise || []).map((subject) => (
                  <Grid item xs={12} md={6} key={subject.subject}>
                    <Card sx={{ height: "100%" }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="h6">{subject.subject}</Typography>
                          <Chip label={subject.strength} color={subject.strength === "Strong" ? "success" : subject.strength === "Average" ? "warning" : "error"} />
                        </Stack>
                        <Typography sx={{ mt: 1 }}>{subject.percentage}% • Trend: {subject.trend}</Typography>
                        <LinearProgress variant="determinate" value={subject.percentage} sx={{ mt: 1.5, height: 8, borderRadius: 99 }} />
                        <Typography color="text.secondary" sx={{ mt: 1.5 }}>{subject.focusArea}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Prediction Engine</Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>{performance.prediction?.nextScore}%</Typography>
                    <Typography color="text.secondary">Confidence: {performance.prediction?.confidence}%</Typography>
                    <Typography color="text.secondary">Attendance: {performance.attendanceScore}%</Typography>
                    <Typography color="text.secondary">Improvement Index: {performance.improvementIndex}</Typography>
                    <Typography color="text.secondary">Percentile: {performance.percentile}</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Badges</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(performance.badges || []).map((badge) => (
                        <Chip key={badge} label={badge} color="secondary" />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Recommendations</Typography>
                    <Stack spacing={1.5}>
                      {(performance.recommendations || []).map((item) => (
                        <Alert key={item} severity="info">{item}</Alert>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Study Plan</Typography>
                    <Stack spacing={1.5}>
                      {(performance.studyPlan || []).map((item) => (
                        <Box key={item.title} sx={{ p: 2, borderRadius: 3, backgroundColor: "#f6f9fc" }}>
                          <Typography fontWeight={700}>{item.title}</Typography>
                          <Typography color="text.secondary">{item.action}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}

export default Performance;
