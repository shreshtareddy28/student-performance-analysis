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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import api from '../api';

function Marks({ role }) {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [formData, setFormData] = useState({
    studentRollNo: '',
    subject: '',
    examType: '',
    marksObtained: '',
    maxMarks: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedRole = role?.toLowerCase();
  const canModify = ['admin', 'faculty'].includes(normalizedRole);
  const showFacultyColumn = ['admin', 'faculty'].includes(normalizedRole);
  const emptyColSpan = showFacultyColumn ? 8 : 7;

  const examTypeOptions = [
    { value: 'mid1', label: 'Mid Semester 1', maxMarks: 30 },
    { value: 'mid2', label: 'Mid Semester 2', maxMarks: 30 },
    { value: 'endsem', label: 'End Semester', maxMarks: 60 },
  ];

  useEffect(() => {
    fetchMarks();
    fetchStudents();
  }, []);

  const fetchMarks = async () => {
    try {
      const response = await api.get('/api/marks');
      setMarks(response.data.marks);
    } catch (error) {
      console.error('Error fetching marks:', error);
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

  const handleOpen = (mark = null) => {
    setEditingMark(mark);
    if (mark) {
      setFormData({
        studentRollNo: mark.studentRollNo,
        subject: mark.subject,
        examType: mark.examType,
        marksObtained: mark.marksObtained,
        maxMarks: mark.maxMarks,
        date: mark.date ? new Date(mark.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        studentRollNo: '',
        subject: '',
        examType: '',
        marksObtained: '',
        maxMarks: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMark(null);
    setFormData({
      studentRollNo: '',
      subject: '',
      examType: '',
      marksObtained: '',
      maxMarks: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleExamTypeChange = (examType) => {
    const selectedExam = examTypeOptions.find(exam => exam.value === examType);
    setFormData({
      ...formData,
      examType,
      maxMarks: selectedExam ? selectedExam.maxMarks : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        marksObtained: Number(formData.marksObtained),
        maxMarks: Number(formData.maxMarks),
        date: new Date(formData.date)
      };

      if (editingMark) {
        await api.put(`/api/marks/${editingMark._id}`, payload);
      } else {
        await api.post('/api/marks', payload);
      }

      fetchMarks();
      window.dispatchEvent(new CustomEvent('marksUpdated'));
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mark record?')) {
      try {
        await api.delete(`/api/marks/${id}`);
        fetchMarks();
        window.dispatchEvent(new CustomEvent('marksUpdated'));
      } catch (error) {
        console.error('Error deleting mark:', error);
      }
    }
  };

  const getStudentName = (rollNo) => {
    const student = students.find(s => s.rollNo === rollNo);
    return student ? student.name : rollNo;
  };

  const getExamTypeLabel = (examType) => {
    const exam = examTypeOptions.find(e => e.value === examType);
    return exam ? exam.label : examType;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Marks
        </Typography>
        {canModify ? (
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Marks
          </Button>
        ) : (
          <Typography variant="subtitle1" color="textSecondary">
            Students can only view marks.
          </Typography>
        )}
      </Box>

      {normalizedRole === 'student' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can only view marks.
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Exam Type</TableCell>
              <TableCell>Obtained</TableCell>
              <TableCell>Max Marks</TableCell>
              <TableCell>Percentage</TableCell>
              <TableCell>Date</TableCell>
              {showFacultyColumn && <TableCell>Faculty</TableCell>}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marks.length > 0 ? (
              marks.map((mark) => (
                <TableRow key={mark._id}>
                  <TableCell>{getStudentName(mark.studentRollNo)}</TableCell>
                  <TableCell>{mark.subject}</TableCell>
                  <TableCell>{getExamTypeLabel(mark.examType)}</TableCell>
                  <TableCell>{mark.marksObtained}</TableCell>
                  <TableCell>{mark.maxMarks}</TableCell>
                  <TableCell>{((mark.marksObtained / mark.maxMarks) * 100).toFixed(1)}%</TableCell>
                  <TableCell>{new Date(mark.date).toLocaleDateString()}</TableCell>
                  {showFacultyColumn && (
                    <TableCell>{mark.faculty_id?.email || 'Unknown'}</TableCell>
                  )}
                  <TableCell>
                    {canModify ? (
                      <>
                        <Button size="small" onClick={() => handleOpen(mark)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" onClick={() => handleDelete(mark._id)}>
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Read-only
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={emptyColSpan} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No marks found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMark ? 'Edit Marks' : 'Add Marks'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <FormControl fullWidth margin="dense">
              <InputLabel>Student</InputLabel>
              <Select
                value={formData.studentRollNo}
                onChange={(e) => setFormData({ ...formData, studentRollNo: e.target.value })}
                required
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student.rollNo}>
                    {student.name} ({student.rollNo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Subject"
              fullWidth
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Exam Type</InputLabel>
              <Select
                value={formData.examType}
                onChange={(e) => handleExamTypeChange(e.target.value)}
                required
              >
                {examTypeOptions.map((exam) => (
                  <MenuItem key={exam.value} value={exam.value}>
                    {exam.label} (Max: {exam.maxMarks})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense"
              label="Marks Obtained"
              type="number"
              fullWidth
              required
              inputProps={{ min: 0, max: formData.maxMarks || 100 }}
              value={formData.marksObtained}
              onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Max Marks"
              type="number"
              fullWidth
              required
              inputProps={{ min: 1 }}
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Date"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingMark ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Marks;