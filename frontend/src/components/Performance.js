import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Assessment,
  School,
  Warning,
  CheckCircle,
  Error,
  Info,
  PictureAsPdf,
} from '@mui/icons-material';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

function Performance({ role }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [performance, setPerformance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [myRollNo, setMyRollNo] = useState('');
  const [showReport, setShowReport] = useState(false);

  const normalizedRole = role?.toLowerCase();
  const canModify = ['admin', 'faculty'].includes(normalizedRole);
  const isStudent = normalizedRole === 'student';

  useEffect(() => {
    if (isStudent) {
      fetchMyProfile();
    } else {
      fetchStudents();
    }
  }, [isStudent]);

  useEffect(() => {
    const handleMarksUpdated = () => {
      if (selectedStudent) {
        loadPerformance();
      }
    };

    window.addEventListener('marksUpdated', handleMarksUpdated);
    return () => {
      window.removeEventListener('marksUpdated', handleMarksUpdated);
    };
  }, [selectedStudent]);

  const fetchMyProfile = async () => {
    try {
      const response = await api.get('/api/students/me');
      setMyRollNo(response.data.student.rollNo);
      setSelectedStudent(response.data.student.rollNo);
      loadPerformance(response.data.student.rollNo);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load your profile');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const loadPerformance = async (rollNo = selectedStudent) => {
    if (!rollNo) return;

    setLoading(true);
    setError('');

    try {
      // If faculty/admin, calculate performance first
      if (canModify && !isStudent) {
        setCalculating(true);
        await api.post(`/api/analysis/calculate/${rollNo}`);
        setCalculating(false);
      }

      // Fetch performance data
      const perfResponse = await api.get(`/api/analysis/${rollNo}`);
      setPerformance(perfResponse.data.performance);

      // Fetch marks data
      const marksResponse = await api.get(`/api/marks/student/${rollNo}`);
      setMarks(marksResponse.data.marks);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
      setCalculating(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'success.main';
      case 'B': return 'warning.main';
      case 'C': return 'info.main';
      case 'F': return 'error.main';
      default: return 'text.primary';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return 'success.main';
      case 'Medium': return 'warning.main';
      case 'High': return 'error.main';
      default: return 'text.primary';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp color="success" />;
      case 'declining': return <TrendingDown color="error" />;
      case 'stable': return <TrendingFlat color="action" />;
      default: return <TrendingFlat color="action" />;
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Strong': return 'success.main';
      case 'Average': return 'warning.main';
      case 'Weak': return 'error.main';
      default: return 'text.primary';
    }
  };

  const generatePDFReport = () => {
    // Simple PDF generation using browser print
    window.print();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Analysis
        </Typography>
        {performance && (
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => setShowReport(true)}
          >
            Generate Report
          </Button>
        )}
      </Box>

      {!canModify && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Student accounts can view previously calculated performance records only. Faculty and admin accounts can calculate or refresh student performance.
        </Alert>
      )}

      {!isStudent && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Student</InputLabel>
            <Select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              label="Select Student"
            >
              {students.map((student) => (
                <MenuItem key={student._id} value={student.rollNo}>
                  {student.name} ({student.rollNo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={() => loadPerformance()}
            disabled={!selectedStudent || loading || calculating}
          >
            {calculating ? 'Calculating...' : loading ? 'Loading...' : canModify ? 'Calculate Performance' : 'View Performance'}
          </Button>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {performance && (
        <div>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Overall Percentage
                  </Typography>
                  <Typography variant="h3" component="div">
                    {performance.percentage}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={performance.percentage}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Grade
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ color: getGradeColor(performance.grade) }}>
                    {performance.grade}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {performance.grade === 'A' ? 'Excellent' :
                     performance.grade === 'B' ? 'Good' :
                     performance.grade === 'C' ? 'Satisfactory' : 'Needs Improvement'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Risk Level
                  </Typography>
                  <Typography variant="h3" component="div" sx={{ color: getRiskColor(performance.riskLevel) }}>
                    {performance.riskLevel}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Rank: #{performance.rank}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Consistency Score
                  </Typography>
                  <Typography variant="h3" component="div">
                    {performance.consistencyScore}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={performance.consistencyScore}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prediction
            </Typography>
            <Card>
              <CardContent>
                <Typography variant="body1">
                  Next exam score prediction: <strong>{performance.prediction?.nextScore?.toFixed(1)}%</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Confidence: {performance.prediction?.confidence}%
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <Grid container spacing={2}>
              {performance.recommendations?.map((rec, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Alert severity="info" icon={<Info />}>
                    {rec}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>
      )}

      {marks.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Subject-wise Performance
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Obtained</TableCell>
                  <TableCell>Max</TableCell>
                  <TableCell>Percentage</TableCell>
                  <TableCell>Strength</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performance?.subjectWise?.map((subject) => (
                  <TableRow key={subject.subject}>
                    <TableCell>{subject.subject}</TableCell>
                    <TableCell>{subject.obtained}</TableCell>
                    <TableCell>{subject.max}</TableCell>
                    <TableCell>{subject.percentage.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Chip
                        label={subject.strength}
                        color={subject.strength === 'Strong' ? 'success' :
                               subject.strength === 'Average' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTrendIcon(subject.trend)}
                        {subject.trend}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Subject Performance Chart
            </Typography>
            <Bar
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Subject-wise Performance' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }}
              data={{
                labels: performance?.subjectWise?.map((s) => s.subject) || [],
                datasets: [
                  {
                    label: 'Percentage',
                    data: performance?.subjectWise?.map((s) => s.percentage) || [],
                    backgroundColor: 'rgba(25, 118, 210, 0.7)',
                  },
                ],
              }}
            />
          </Paper>
        </Box>
      )}

      {/* PDF Report Dialog */}
      <Dialog open={showReport} onClose={() => setShowReport(false)} maxWidth="md" fullWidth>
        <DialogTitle>Performance Report</DialogTitle>
        <DialogContent>
          {performance && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom align="center">
                Student Performance Report
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Roll No:</strong> {selectedStudent}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Overall Percentage:</strong> {performance.percentage}%
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Grade:</strong> {performance.grade}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Risk Level:</strong> {performance.riskLevel}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Class Rank:</strong> #{performance.rank}
              </Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Subject-wise Performance
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Percentage</TableCell>
                      <TableCell>Strength</TableCell>
                      <TableCell>Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performance.subjectWise?.map((subject) => (
                      <TableRow key={subject.subject}>
                        <TableCell>{subject.subject}</TableCell>
                        <TableCell>{subject.percentage.toFixed(1)}%</TableCell>
                        <TableCell>{subject.strength}</TableCell>
                        <TableCell>{subject.trend}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Recommendations
              </Typography>
              <ul>
                {performance.recommendations?.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReport(false)}>Close</Button>
          <Button onClick={generatePDFReport} variant="contained">
            Print/Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Performance;