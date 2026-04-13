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
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

function Performance({ role }) {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [performance, setPerformance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const normalizedRole = role?.toLowerCase();
  const canModify = ['admin', 'faculty'].includes(normalizedRole);

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const loadPerformance = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    setError('');

    try {
      if (canModify) {
        await api.post('/api/analysis', { student_id: selectedStudent });
      }

      const perfResponse = await api.get(`/api/analysis/${selectedStudent}`);
      setPerformance(perfResponse.data.performance);

      const marksResponse = await api.get(`/api/marks/student/${selectedStudent}`);
      setMarks(marksResponse.data.marks);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'success.main';
      case 'B': return 'warning.main';
      case 'C': return 'error.main';
      default: return 'text.primary';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Performance Analysis
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Student</InputLabel>
          <Select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            label="Select Student"
          >
            {students.map((student) => (
              <MenuItem key={student._id} value={student._id}>
                {student.name} ({student.rollNumber})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={loadPerformance}
          disabled={!selectedStudent || loading}
        >
          {loading ? (canModify ? 'Calculating...' : 'Loading...') : canModify ? 'Calculate Performance' : 'View Performance'}
        </Button>
      </Box>

      {!canModify && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Student accounts can view previously calculated performance records only. Faculty and admin accounts can calculate or refresh student performance.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {performance && (
        <div>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Marks
                  </Typography>
                  <Typography variant="h4" component="div">
                    {performance.total}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Percentage
                  </Typography>
                  <Typography variant="h4" component="div">
                    {performance.percentage}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Grade
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: getGradeColor(performance.grade) }}>
                    {performance.grade}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Risk Level
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ color: performance?.riskLevel === 'high' ? 'error.main' : performance?.riskLevel === 'medium' ? 'warning.main' : 'success.main' }}>
                    {performance?.riskLevel ? performance.riskLevel.charAt(0).toUpperCase() + performance.riskLevel.slice(1) : 'Low'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Predicted Next Score
                  </Typography>
                  <Typography variant="h4" component="div">
                    {performance?.prediction?.nextScore?.toFixed(1) || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Confidence: {performance?.prediction?.confidence ? (performance.prediction.confidence * 100).toFixed(0) : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            {performance?.riskReasons && performance.riskReasons.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Risk Factors:</Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {performance.riskReasons.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {performance?.recommendations && performance.recommendations.length > 0 && (
              <Alert severity="info">
                <Typography variant="subtitle2">Recommendations:</Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {performance.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </Alert>
            )}
          </Box>
        </div>
      )}

      {marks.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Subject-wise Marks
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>Marks</TableCell>
                  <TableCell>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marks.map((mark) => (
                  <TableRow key={mark._id}>
                    <TableCell>{mark.subject}</TableCell>
                    <TableCell>{mark.marks}</TableCell>
                    <TableCell>{((mark.marks / 100) * 100).toFixed(1)}%</TableCell>
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
                  title: { display: true, text: 'Marks by Subject' },
                },
              }}
              data={{
                labels: marks.map((mark) => mark.subject),
                datasets: [
                  {
                    label: 'Marks',
                    data: marks.map((mark) => mark.marks),
                    backgroundColor: 'rgba(25, 118, 210, 0.7)',
                  },
                ],
              }}
            />
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Performance Trend (Simulated)
            </Typography>
            <Line
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Performance Over Time' },
                },
              }}
              data={{
                labels: ['Exam 1', 'Exam 2', 'Exam 3', 'Current'],
                datasets: [
                  {
                    label: 'Percentage',
                    data: [
                      Math.max(0, performance.percentage - 10),
                      Math.max(0, performance.percentage - 5),
                      performance.percentage,
                      performance.prediction?.nextScore || performance.percentage,
                    ].map(val => Number(val) || 0),
                    borderColor: 'rgba(25, 118, 210, 1)',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  },
                ],
              }}
            />
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default Performance;