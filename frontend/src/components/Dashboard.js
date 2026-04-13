import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Dashboard() {
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalMarksRecords: 0,
    averagePercentage: 0,
    topPerformers: [],
    atRiskCount: 0,
    subjectAverages: [],
    passFailRatio: { pass: 0, fail: 0 },
    riskLevels: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/api/analysis/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h3" component="div">
                    {summary.totalStudents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Marks Records
                  </Typography>
                  <Typography variant="h3" component="div">
                    {summary.totalMarksRecords}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Average Percentage
                  </Typography>
                  <Typography variant="h3" component="div">
                    {summary.averagePercentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pass/Fail Ratio
                  </Typography>
                  <Typography variant="h5" component="div">
                    {summary.passFailRatio.pass}/{summary.passFailRatio.fail}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    High Risk Students
                  </Typography>
                  <Typography variant="h3" component="div">
                    {summary.riskLevels.find(r => r._id === 'high')?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Top Performers
                  </Typography>
                  {summary.topPerformers.length > 0 ? (
                    <List>
                      {summary.topPerformers.map((student) => (
                        <ListItem key={student.studentId} disableGutters>
                          <ListItemText
                            primary={`${student.name} (${student.rollNumber})`}
                            secondary={`Percentage: ${student.percentage}% | Total: ${student.totalMarks}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No top performer data yet.</Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Subject Average Scores
                  </Typography>
                  {summary.subjectAverages.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Subject</TableCell>
                            <TableCell>Average Marks</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {summary.subjectAverages.map((subject) => (
                            <TableRow key={subject.subject}>
                              <TableCell>{subject.subject}</TableCell>
                              <TableCell>{subject.averageMarks}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No subject averages available.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Pass/Fail Distribution
                  </Typography>
                  <Pie
                    data={{
                      labels: ['Pass', 'Fail'],
                      datasets: [{
                        data: [summary.passFailRatio.pass, summary.passFailRatio.fail],
                        backgroundColor: ['#4caf50', '#f44336'],
                      }],
                    }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Levels
                  </Typography>
                  <List>
                    {(summary.riskLevels || []).map((risk) => {
                      const riskName = risk._id ? `${risk._id.charAt(0).toUpperCase() + risk._id.slice(1)} Risk` : 'Unknown Risk';
                      return (
                        <ListItem key={risk._id || Math.random()}>
                          <ListItemText primary={riskName} secondary={`Count: ${risk.count}`} />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Welcome to the Performance Analysis System
              </Typography>
              <Typography variant="body1">
                Use the navigation above to manage students, enter marks, and analyze performance data.
              </Typography>
            </Paper>
          </Box>
        </>
      )}
    </Container>
  );
}

export default Dashboard;