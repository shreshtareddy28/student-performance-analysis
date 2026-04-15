import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import api from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard({ auth }) {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const summaryResponse = await api.get("/api/analysis/dashboard/summary");
        setSummary(summaryResponse.data);

        if (auth.role !== "student") {
          const analyticsResponse = await api.get("/api/analysis/class/analytics");
          setAnalytics(analyticsResponse.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    };

    loadDashboard();
  }, [auth.role]);

  const statCards =
    auth.role === "student"
      ? [
          { label: "Current Score", value: `${summary?.stats?.currentPercentage || 0}%` },
          { label: "Attendance", value: `${summary?.stats?.attendance || 0}%` },
          { label: "Target CGPA", value: summary?.stats?.targetCgpa || 0 },
          { label: "Risk Level", value: summary?.stats?.riskLevel || "Not calculated" },
        ]
      : [
          { label: "Students", value: summary?.stats?.studentCount || 0 },
          { label: "Faculty", value: summary?.stats?.facultyCount || 0 },
          { label: "Performance Records", value: summary?.stats?.performanceCount || 0 },
          { label: "Urgent Cases", value: summary?.stats?.urgentInterventions || 0 },
        ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 6,
          color: "white",
          background: "linear-gradient(135deg, #113c6b 0%, #187692 52%, #e86f2d 100%)",
          mb: 3,
        }}
      >
        <Typography variant="h4">Welcome back, {auth.user?.name || "Academic Partner"}</Typography>
        <Typography sx={{ mt: 1, maxWidth: 820, color: "rgba(255,255,255,0.84)" }}>
          {auth.role === "student"
            ? "Your dashboard focuses on progress, recovery priorities, and clear next actions."
            : "This dashboard surfaces academic health, intervention pressure, and the strongest opportunities for improvement."}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={12} md={3} key={card.label}>
            <Card sx={{ background: "linear-gradient(180deg, #ffffff, #f6fbff)" }}>
              <CardContent>
                <Typography color="text.secondary">{card.label}</Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {auth.role === "student" ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Personal Study Plan</Typography>
                <Stack spacing={2}>
                  {(summary?.studyPlan || []).map((item) => (
                    <Box key={item.title} sx={{ p: 2, borderRadius: 4, backgroundColor: "#f6f9fc" }}>
                      <Typography fontWeight={700}>{item.title}</Typography>
                      <Typography color="text.secondary">{item.action}</Typography>
                    </Box>
                  ))}
                  {!summary?.studyPlan?.length && (
                    <Typography color="text.secondary">Run a performance calculation to generate the action plan.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Achievement Badges</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(summary?.badges || []).map((badge) => (
                      <Chip key={badge} label={badge} color="secondary" />
                    ))}
                    {!summary?.badges?.length && <Typography color="text.secondary">Badges will appear after analysis.</Typography>}
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Recommendations</Typography>
                  <Stack spacing={1.5}>
                    {(summary?.recommendations || []).map((item) => (
                      <Alert key={item} severity="info">{item}</Alert>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Subject Performance Pulse</Typography>
                {analytics?.subjectAverages?.length ? (
                  <Bar
                    data={{
                      labels: analytics.subjectAverages.map((item) => item.subject),
                      datasets: [
                        {
                          label: "Average score",
                          data: analytics.subjectAverages.map((item) => item.averagePercentage),
                          backgroundColor: ["#113c6b", "#187692", "#e86f2d", "#0d7a6f", "#8d493a"],
                        },
                      ],
                    }}
                    options={{ responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }}
                  />
                ) : (
                  <Typography color="text.secondary">Add marks and calculate performance to unlock analytics.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Intervention Alerts</Typography>
                  <Stack spacing={1.5}>
                    {(summary?.alerts || analytics?.alerts || []).map((item) => (
                      <Alert key={item} severity="warning">{item}</Alert>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>At-Risk Queue</Typography>
                  <Stack spacing={2}>
                    {(analytics?.atRiskStudents || []).map((student) => (
                      <Box key={student.studentRollNo} sx={{ p: 2, borderRadius: 3, backgroundColor: "#fff7ef" }}>
                        <Typography fontWeight={700}>{student.studentRollNo}</Typography>
                        <Typography color="text.secondary">
                          {student.percentage}% • {student.riskLevel} • {student.interventionPriority}
                        </Typography>
                        <LinearProgress
                          value={student.percentage}
                          variant="determinate"
                          color={student.percentage < 50 ? "error" : "warning"}
                          sx={{ mt: 1, height: 8, borderRadius: 99 }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Performers</Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
                  {(summary?.topPerformers || analytics?.topPerformers || []).map((item, index) => (
                    <Box key={`${item.studentRollNo}-${index}`} sx={{ minWidth: 210, p: 2, borderRadius: 4, backgroundColor: "#f6f9fc" }}>
                      <Typography fontWeight={700}>#{index + 1} {item.studentRollNo}</Typography>
                      <Typography color="text.secondary">{item.percentage}% overall</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default Dashboard;
