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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import api from '../api';

function Students({ role }) {
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    password: '',
    branch: '',
    attendancePercentage: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedRole = role?.toLowerCase();
  const canModify = ['admin', 'faculty'].includes(normalizedRole);

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
      rollNo: student.rollNo,
      email: student.user_id?.email || '',
      password: '', // Don't populate password for security
      branch: student.branch || '',
      attendancePercentage: student.attendancePercentage || '',
    } : {
      name: '',
      rollNo: '',
      email: '',
      password: '',
      branch: '',
      attendancePercentage: ''
    });
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      rollNo: '',
      email: '',
      password: '',
      branch: '',
      attendancePercentage: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let payload = formData;
      if (editingStudent) {
        // For editing, only send updatable fields
        payload = {
          name: formData.name,
          branch: formData.branch,
          attendancePercentage: formData.attendancePercentage ? Number(formData.attendancePercentage) : undefined,
        };
      }

      if (editingStudent) {
        await api.put(`/api/students/${editingStudent.rollNo}`, payload);
      } else {
        await api.post('/api/students', payload);
      }

      fetchStudents();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rollNo) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/api/students/${rollNo}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        setError(error.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const branchOptions = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other'];

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

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Roll No</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Attendance %</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.rollNo}</TableCell>
                <TableCell>{student.user_id?.email || 'N/A'}</TableCell>
                <TableCell>{student.branch || 'N/A'}</TableCell>
                <TableCell>{student.attendancePercentage || 0}%</TableCell>
                <TableCell>
                  {canModify ? (
                    <>
                      <Button size="small" onClick={() => handleOpen(student)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => handleDelete(student.rollNo)}>
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
              label="Roll No"
              fullWidth
              required
              value={formData.rollNo}
              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
              disabled={editingStudent} // Don't allow rollNo changes when editing
            />
            <TextField
              margin="dense"
              label="Email"
              fullWidth
              required={!editingStudent}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={editingStudent} // Don't allow email changes when editing
            />
            {!editingStudent && (
              <TextField
                margin="dense"
                label="Password"
                fullWidth
                required={!editingStudent}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
            <FormControl fullWidth margin="dense">
              <InputLabel>Branch</InputLabel>
              <Select
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                label="Branch"
              >
                {branchOptions.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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