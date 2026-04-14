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
  Alert,
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

function Dashboard({ role }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/analysis/class/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching class analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const isAdminOrFaculty = role === 'admin' || role === 'faculty';

  if (!isAdminOrFaculty) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">
          Student accounts can view their own performance data. Please use the Performance section to view your results.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Class Analytics Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : analytics ? (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h3" component="div">
                    {analytics.totalStudents}
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
                    {analytics.totalMarksRecords}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Class Average
                  </Typography>
                  <Typography variant="h3" component="div">
                    {analytics.overallAverage}%
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
                    {analytics.passFailRatio.pass}/{analytics.passFailRatio.fail}
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
                    Top 5 Performers
                  </Typography>
                  {analytics.topPerformers && analytics.topPerformers.length > 0 ? (
                    <List>
                      {analytics.topPerformers.map((student, index) => (
                        <ListItem key={student._id} disableGutters>
                          <ListItemText
                            primary={`${index + 1}. ${student.studentRollNo?.name || 'Unknown'} (${student.studentRollNo?.rollNo || 'N/A'})`}
                            secondary={`Percentage: ${student.percentage}% | Rank: ${student.rank}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No performance data available yet.</Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Subject Performance
                  </Typography>
                  {analytics.subjectAverages && analytics.subjectAverages.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Subject</TableCell>
                            <TableCell>Average %</TableCell>
                            <TableCell>Students</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analytics.subjectAverages.map((subject) => (
                            <TableRow key={subject.subject}>
                              <TableCell>{subject.subject}</TableCell>
                              <TableCell>{subject.averagePercentage.toFixed(1)}%</TableCell>
                              <TableCell>{subject.studentCount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No subject data available.</Typography>
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
                        data: [analytics.passFailRatio.pass, analytics.passFailRatio.fail],
                        backgroundColor: ['#4caf50', '#f44336'],
                      }],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Weakest Subjects
                  </Typography>
                  {analytics.weakestSubjects && analytics.weakestSubjects.length > 0 ? (
                    <List>
                      {analytics.weakestSubjects.map((subject) => (
                        <ListItem key={subject.subject} disableGutters>
                          <ListItemText
                            primary={subject.subject}
                            secondary={`Average: ${subject.averagePercentage.toFixed(1)}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No subject performance data available.</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {analytics.subjectAverages && analytics.subjectAverages.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Subject-wise Performance Chart
                </Typography>
                <Bar
                  data={{
                    labels: analytics.subjectAverages.map(s => s.subject),
                    datasets: [{
                      label: 'Average Percentage',
                      data: analytics.subjectAverages.map(s => s.averagePercentage),
                      backgroundColor: 'rgba(25, 118, 210, 0.7)',
                    }],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Subject Performance Overview' },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </Paper>
            </Box>
          )}
        </>
      ) : (
        <Alert severity="info">No analytics data available yet. Add some student marks and calculate performance to see analytics.</Alert>
      )}
    </Container>
  );
}

export default Dashboard;