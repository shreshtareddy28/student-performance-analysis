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
  Box,
} from '@mui/material';
import api from '../api';

function Students({ role }) {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ name: '', rollNumber: '', class: '', branch: '', attendancePercentage: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/api/students');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleOpen = (student = null) => {
    setEditingStudent(student);
    setFormData(student ? {
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      branch: student.branch || '',
      attendancePercentage: student.attendancePercentage || '',
    } : { name: '', rollNumber: '', class: '', branch: '', attendancePercentage: '' });
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
    setFormData({ name: '', rollNumber: '', class: '', branch: '', attendancePercentage: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingStudent) {
        await api.put(`/api/students/${editingStudent._id}`, formData);
      } else {
        await api.post('/api/students', formData);
      }

      fetchStudents();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/api/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const normalizedRole = role?.toLowerCase();
  const canModify = ['admin', 'faculty'].includes(normalizedRole);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Students</Typography>
        {canModify ? (
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Student
          </Button>
        ) : (
          <Typography variant="subtitle1" color="textSecondary">
            Students have read-only access.
          </Typography>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Roll Number</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Attendance %</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.rollNumber}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.branch || 'N/A'}</TableCell>
                <TableCell>{student.attendancePercentage || 100}%</TableCell>
                <TableCell>
                  {canModify ? (
                    <>
                      <Button size="small" onClick={() => handleOpen(student)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(student._id)}>
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStudent ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Roll Number"
              fullWidth
              required
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Class"
              fullWidth
              required
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Branch"
              fullWidth
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Attendance Percentage"
              fullWidth
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={formData.attendancePercentage}
              onChange={(e) => setFormData({ ...formData, attendancePercentage: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingStudent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default Students;